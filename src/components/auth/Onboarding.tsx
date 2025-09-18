import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../auth/AuthProvider";
import { FaUser, FaChartLine, FaCamera } from "react-icons/fa";
import logo from "../../assets/Frame.png";
import BoltBackground from "../homepage/BoltBackground";
import Footer from "../homepage/Footer";
import LoadingScreen from "../ui/loadingScreen";
import { compressImageToTargetSize, validateImageFile, formatFileSize } from "../../lib/imageCompression";

const Onboarding = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isStepValid, setIsStepValid] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profile_picture: null as File | null,
  });
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  // Check if user is authenticated and has completed onboarding
  useEffect(() => {
    const checkProfile = async () => {
      if (!session?.user?.id) {
        // If not logged in, redirect to login
        navigate('/getstarted');
        return;
      }

      try {
        // Get current user from auth to ensure session is valid
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.log('Auth error - user not found, redirecting to signup:', userError?.message);
          // Clear any invalid session data
          await supabase.auth.signOut();
          navigate('/getstarted');
          return;
        }

        // Check if user already has a profile with username
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 is the "not found" error code
            console.error('Error checking profile:', error);
          }
          // Profile doesn't exist, stay on onboarding
          return;
        }

        if (profile?.username) {
          // If profile exists and has a username, redirect to dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        // On error, clear session and redirect to get started
        await supabase.auth.signOut();
        navigate('/getstarted');
      }
    };

    checkProfile();
  }, [session, navigate]);

  // Add validation for each step
  useEffect(() => {
    switch (currentStep) {
      case 1:
        setIsStepValid(
          formData.username.trim() !== '' &&
          formData.bio.trim().length <= 160 // Limit bio to 160 characters
        );
        break;
      case 2:
        setIsStepValid(true);
        break;
      default:
        setIsStepValid(false);
    }
  }, [currentStep, formData]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile picture change (only store locally, don't upload yet)
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate the image file first
      const validation = validateImageFile(file, 10); // 10MB max
      if (!validation.isValid) {
        alert(validation.error || 'Invalid image file');
        return;
      }

      // Just store the file locally, don't upload to storage yet
      setFormData(prev => ({ ...prev, profile_picture: file }));
      
      // Create a local preview URL for display
      const previewUrl = URL.createObjectURL(file);
      setProfilePictureUrl(previewUrl);
    }
  };


  // Handle next step
  const handleNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit form and navigate to dashboard
      handleSubmit();
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Handle form submission (upload image and save profile only when completing onboarding)
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(userError?.message || 'No user found');
  
      // Reserved route/usernames to protect
      const reservedUsernames = [
        'dashboard', 'premiumdashboard', 'admin', 'login', 'signup','getstarted', 'profile', 'settings', 'api', 'publicprofile', 'privateprofile', 'homepage', 'about', 'contact', 'terms', 'privacy', 'faq', 'features', 'pricing', 'logout', 'user', 'users', 'static', 'assets', 'vercel', 'next', 'app', 'src', 'components', 'lib', 'publicprofile', 'clinkr',
      ];
      if (reservedUsernames.includes(formData.username.trim().toLowerCase())) {
        alert('This username is reserved. Please choose another one.');
        setIsLoading(false);
        return;
      }
  
      // Check username uniqueness
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', formData.username)
        .single();
  
      if (existingUser) {
        alert('Username already taken. Please choose another one.');
        setIsLoading(false);
        return;
      }
  
      // Upload profile picture only now (when completing onboarding)
      let finalProfilePictureUrl = null;
      
      if (formData.profile_picture) {
        setIsUploadingPicture(true);
        try {
          // Compress the image to under 300KB
          const compressionResult = await compressImageToTargetSize(formData.profile_picture, 300);
          
          console.log(`Image compressed: ${formatFileSize(compressionResult.originalSize)} → ${formatFileSize(compressionResult.compressedSize)} (${compressionResult.compressionRatio.toFixed(1)}% reduction)`);
          
          const fileName = `${user.id}-${Math.random().toString(36).substring(7)}.jpg`;
          
          // Upload the compressed file
          const { error: uploadError } = await supabase.storage
            .from('user-data')
            .upload(fileName, compressionResult.compressedBlob, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('user-data')
            .getPublicUrl(fileName);
            
          finalProfilePictureUrl = publicUrl;
        } catch (err: any) {
          alert('Failed to upload profile picture: ' + err.message);
          setIsLoading(false);
          setIsUploadingPicture(false);
          return;
        } finally {
          setIsUploadingPicture(false);
        }
      }
      
      // Save profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: formData.username,
          bio: formData.bio,
          profile_picture: finalProfilePictureUrl,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
  
      if (profileError) {
        console.error('Profile save error:', profileError);
        throw new Error(`Failed to save profile: ${profileError.message}`);
      }
  
      // Navigate to dashboard after successful save
      if (profileData) {
        navigate('/dashboard');
      } else {
        throw new Error('Profile data not saved');
      }
    } catch (error: any) {
      console.error('Submission failed:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup local URL when component unmounts
  useEffect(() => {
    return () => {
      if (profilePictureUrl && profilePictureUrl.startsWith('blob:')) {
        URL.revokeObjectURL(profilePictureUrl);
      }
    };
  }, [profilePictureUrl]);

  return (
    <div className="min-h-screen relative">
      {/* Show full loading screen when submitting */}
      {isLoading && <LoadingScreen />}
      
      {/* Background */}
      <BoltBackground />
      
      <div className="flex flex-col justify-between min-h-screen relative z-10">
        <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(237,123,0,0.02)] via-transparent to-[rgba(252,187,31,0.02)] opacity-70 rounded-xl" />
            
            {/* Animated accent */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: 'linear-gradient(to right, #ED7B00, #E66426, #ED7B00)' }} />
            
            {/* Header Section */}
            <div className="text-center relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <img 
                  src={logo} 
                  alt="Clinkr Logo" 
                  className="h-8 w-auto sm:h-10" 
                />
                <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#ED7B00] via-[#E66426] to-[#ED7B00] bg-clip-text text-transparent">
                  Clinkr
                </h1>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Welcome to Clinkr
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Let's set up your account to get the most out of Clinkr
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="relative mb-8">
              <div className="absolute left-0 right-0 h-0.5 top-5 opacity-20 rounded-full" style={{ background: 'linear-gradient(to right, #ED7B00, #E66426, #ED7B00)' }}></div>
              
              <div className="flex justify-between items-center relative">
                {[1, 2].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        currentStep >= step 
                          ? 'text-white shadow-lg'
                          : 'bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-700' 
                      } relative z-10`}
                      style={currentStep >= step ? { background: 'linear-gradient(to bottom right, #ED7B00, #E66426, #ED7B00)' } : {}}
                    >
                      {step === 1 ? <FaUser className="text-sm" /> : <FaChartLine className="text-sm" />}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${currentStep >= step ? 'text-gray-700' : 'text-gray-400'}`}>
                      {step === 1 ? 'Profile' : 'Finish'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Basic Profile */}
            {currentStep === 1 && (
              <div className="space-y-6 relative z-10">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full p-1 flex items-center justify-center overflow-hidden shadow-lg" style={{ background: 'linear-gradient(to top right, #ED7B00, #E66426, #FCBB1F)' }}>
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        {formData.profile_picture ? (
                          <div className="relative w-full h-full">
                            <img
                              src={profilePictureUrl || URL.createObjectURL(formData.profile_picture)}
                              alt="Profile"
                              className="w-full h-full object-cover rounded-full"
                            />
                            {isUploadingPicture && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full z-10">
                                <div className="flex flex-col items-center justify-center">
                                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-white text-xs mt-2 font-medium">Uploading...</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <FaUser size={40} style={{ color: '#ED7B00' }} />
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 text-white p-2 rounded-full transition-colors shadow-lg"
                      style={{ background: 'linear-gradient(to right, #ED7B00, #E66426)' }}
                    >
                      <FaCamera size={16} />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-600">Upload a profile picture</p>
                </div>
              
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent sm:text-sm transition-all duration-200"
                    style={{ '--focus-ring': 'rgba(237, 123, 0, 0.3)' } as React.CSSProperties}
                    placeholder="doejohn999"
                    value={formData.username}
                    onChange={e => {
                      const value = e.target.value.replace(/\s/g, '');
                      setFormData(prev => ({ ...prev, username: value }));
                    }}
                  />
                  <p className="text-xs mt-1 font-medium" style={{ color: '#FCBB1F' }}>⚠️ Username cannot be changed later.</p>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent sm:text-sm transition-all duration-200 resize-none"
                    style={{ '--focus-ring': 'rgba(237, 123, 0, 0.3)' } as React.CSSProperties}
                    placeholder="Write a crisp bio within 160 characters"
                    value={formData.bio}
                    onChange={handleInputChange}
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/160 characters</p>
                </div>
              </div>
            )}

            {/* Step 2: Final Step */}
            {currentStep === 2 && (
              <div className="space-y-6 text-center relative z-10">
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/40">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #ED7B00, #E66426, #ED7B00)' }}>
                    <FaChartLine size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">You're All Set!</h3>
                  <p className="text-gray-600 mb-4">
                    Your Clinkr profile is ready to go. Start tracking your link metrics and grow your online presence.
                  </p>
                  <div className="py-3">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-full rounded-full" style={{ background: 'linear-gradient(to right, #ED7B00, #E66426, #ED7B00)' }}>
                        <LoadingScreen compact />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 gap-4 relative z-10">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevStep}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNextStep}
                disabled={isLoading || !isStepValid}
                className="btn-primary flex-1 py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-semibold">
                  {currentStep < 2 ? 'Next' : 'Get Started'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-8">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Onboarding;