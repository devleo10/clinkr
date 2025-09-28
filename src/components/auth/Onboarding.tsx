import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../auth/AuthProvider";
import { FaUser, FaChartLine, FaCamera, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import logo from "../../assets/Frame.png";
import BoltBackground from "../homepage/BoltBackground";
import Footer from "../homepage/Footer";
import LoadingScreen from "../ui/loadingScreen";
import { compressImageToTargetSize, validateImageFile, formatFileSize } from "../../lib/imageCompression";
import { toast } from 'react-hot-toast';

const Onboarding = () => {
  const navigate = useNavigate();
  const { session, refreshProfile } = useAuth();
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
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState<string>('');

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

  // Username validation
  useEffect(() => {
    const validateUsername = async () => {
      const username = formData.username.trim();
      
      if (!username) {
        setUsernameStatus('idle');
        setUsernameError('');
        return;
      }

      // Check username format
      if (username.length < 3) {
        setUsernameStatus('invalid');
        setUsernameError('Username must be at least 3 characters');
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setUsernameStatus('invalid');
        setUsernameError('Username can only contain letters, numbers, and underscores');
        return;
      }

      // Reserved usernames
      const reservedUsernames = [
        'dashboard', 'premiumdashboard', 'admin', 'login', 'signup', 'getstarted', 
        'profile', 'settings', 'api', 'publicprofile', 'privateprofile', 'homepage', 
        'about', 'contact', 'terms', 'privacy', 'faq', 'features', 'pricing', 
        'logout', 'user', 'users', 'static', 'assets', 'vercel', 'next', 'app', 
        'src', 'components', 'lib', 'clinkr'
      ];

      if (reservedUsernames.includes(username.toLowerCase())) {
        setUsernameStatus('invalid');
        setUsernameError('This username is reserved');
        return;
      }

      // Check availability
      setUsernameStatus('checking');
      try {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .single();

        if (existingUser) {
          setUsernameStatus('taken');
          setUsernameError('Username is already taken');
        } else {
          setUsernameStatus('available');
          setUsernameError('');
        }
      } catch (error) {
        // If no user found, it's available
        setUsernameStatus('available');
        setUsernameError('');
      }
    };

    const timeoutId = setTimeout(validateUsername, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  // Add validation for each step
  useEffect(() => {
    switch (currentStep) {
      case 1:
        setIsStepValid(
          formData.username.trim() !== '' &&
          formData.bio.trim().length <= 160 &&
          usernameStatus === 'available'
        );
        break;
      case 2:
        setIsStepValid(true);
        break;
      default:
        setIsStepValid(false);
    }
  }, [currentStep, formData, usernameStatus]);

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
        toast.error(validation.error || 'Invalid image file');
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
        toast.error('This username is reserved. Please choose another one.');
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
        toast.error('Username already taken. Please choose another one.');
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
          toast.error('Failed to upload profile picture: ' + err.message);
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
        console.log('Profile created successfully, navigating to dashboard');
        // Refresh the AuthProvider's profile check to ensure it knows about the new profile
        await refreshProfile();
        // Small delay to ensure state updates
        setTimeout(() => {
          navigate('/dashboard');
        }, 200);
      } else {
        throw new Error('Profile data not saved');
      }
    } catch (error: any) {
      console.error('Submission failed:', error);
      toast.error(`Error: ${error.message}`);
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gradient">
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
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full p-1 flex items-center justify-center overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl" style={{ background: 'linear-gradient(to top right, #ED7B00, #E66426, #FCBB1F)' }}>
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
                      className="absolute bottom-0 right-0 text-white p-2 rounded-full transition-all duration-300 shadow-lg hover:scale-110 hover:shadow-xl"
                      style={{ background: 'linear-gradient(to right, #ED7B00, #E66426)' }}
                      title="Upload profile picture"
                    >
                      <FaCamera size={16} />
                    </button>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Click to upload</span>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Upload a profile picture</p>
                    <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                  </div>
                </div>
              
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="relative">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className={`mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 pr-10 bg-white/80 backdrop-blur-sm border text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent sm:text-sm transition-all duration-200 ${
                        usernameStatus === 'available' ? 'border-green-300' : 
                        usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-300' : 
                        'border-gray-300'
                      }`}
                      style={{ '--focus-ring': 'rgba(237, 123, 0, 0.3)' } as React.CSSProperties}
                      placeholder="doejohn999"
                      value={formData.username}
                      onChange={e => {
                        const value = e.target.value.replace(/\s/g, '');
                        setFormData(prev => ({ ...prev, username: value }));
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {usernameStatus === 'checking' && (
                        <FaSpinner className="animate-spin text-gray-400" size={16} />
                      )}
                      {usernameStatus === 'available' && (
                        <FaCheck className="text-green-500" size={16} />
                      )}
                      {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                        <FaTimes className="text-red-500" size={16} />
                      )}
                    </div>
                  </div>
                  {usernameError && (
                    <p className="text-xs mt-1 text-red-600 font-medium">{usernameError}</p>
                  )}
                  {usernameStatus === 'available' && (
                    <p className="text-xs mt-1 text-green-600 font-medium">✓ Username is available</p>
                  )}
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
                <div className="bg-white/60 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-white/40">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #ED7B00, #E66426, #ED7B00)' }}>
                    <FaChartLine size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">You're All Set!</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Your Clinkr profile is ready to go. Start tracking your link metrics and grow your online presence.
                  </p>
                  
                  {/* Profile Preview */}
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200 mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Profile Preview</h4>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {formData.profile_picture ? (
                          <img
                            src={profilePictureUrl || URL.createObjectURL(formData.profile_picture)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaUser size={20} style={{ color: '#ED7B00' }} />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">@{formData.username}</p>
                        <p className="text-sm text-gray-600">{formData.bio || 'No bio yet'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Features Preview */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span>Link Analytics</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span>Custom URLs</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      <span>Profile Page</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      <span>Premium Features</span>
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