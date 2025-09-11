import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../auth/AuthProvider";
import { FaUser, FaLink, FaChartLine, FaCamera, FaPlus, FaTrash } from "react-icons/fa";
import logo from "../../assets/Frame.png";
import BoltBackground from "../homepage/BoltBackground";
import Footer from "../homepage/Footer";
import LoadingScreen from "../ui/loadingScreen";

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
    links: [{ title: '', url: '' }],
  });
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  // Add this useEffect at the top of your component
  useEffect(() => {
    const checkProfile = async () => {
      if (!session?.user?.id) {
        // If not logged in, redirect to login
        navigate('/getstarted');
        return;
      }

      try {
        // Check if user already has a profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 is the "not found" error code
            console.error('Error checking profile:', error);
          }
        } else if (profile?.username) {
          // If profile exists and has a username, redirect to dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
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
        setIsStepValid(formData.links.length > 0 && formData.links.every(link => link.url.trim() !== ''));
        break;
      case 3:
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

  // Handle profile picture change
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size too large. Please choose an image under 5MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      setFormData(prev => ({ ...prev, profile_picture: file }));
      setIsUploadingPicture(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error(userError?.message || 'No user found');
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        // Upload the file (skip bucket creation)
        const { error: uploadError } = await supabase.storage
          .from('user-data')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        if (uploadError) throw uploadError;
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('user-data')
          .getPublicUrl(fileName);
        setProfilePictureUrl(publicUrl);
      } catch (err: any) {
        alert('Failed to upload profile picture: ' + err.message);
      } finally {
        setIsUploadingPicture(false);
      }
    }
  };

  // Update handleLinkChange to only update formData.links
  const handleLinkChange = (idx: number, field: 'url' | 'title', value: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) =>
        i === idx ? { ...link, [field]: value } : link
      ),
    }));
  };

  const removeLink = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== idx),
    }));
  };

  // Handle next step
  const handleNextStep = () => {
    if (currentStep < 3) {
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

  // Handle form submission
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
  
      // In handleSubmit, use profilePictureUrl if available
      let finalProfilePictureUrl = profilePictureUrl;
      if (!finalProfilePictureUrl && formData.profile_picture) {
        // fallback: upload if not already uploaded (shouldn't happen)
        const fileExt = formData.profile_picture.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('user-data')
          .upload(fileName, formData.profile_picture, {
            cacheControl: '3600',
            upsert: false
          });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('user-data')
          .getPublicUrl(fileName);
        finalProfilePictureUrl = publicUrl;
      }
  
      // Separate URLs and titles
      const link_title = formData.links.map(input => input.title);
  
      // Save profile data with RLS handling
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: formData.username,
          bio: formData.bio,
          profile_picture: finalProfilePictureUrl,
          links: formData.links.map(input => input.url),
          link_title: link_title,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
  
      if (profileError) {
        console.error('Profile save error:', profileError);
        // Log the error but continue with navigation
        console.warn('Proceeding despite profile save error:', profileError.message);
      }
  
      // Only navigate to profile page if profile data is saved successfully
      if (profileData) {
        navigate('/privateprofile');
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

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <BoltBackground />
      
      <div className="flex flex-col justify-between min-h-screen relative z-10">
        <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 opacity-70 rounded-xl" />
            
            {/* Animated accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 rounded-t-xl" />
            
            {/* Header Section */}
            <div className="text-center relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <img 
                  src={logo} 
                  alt="Clinkr Logo" 
                  className="h-8 w-auto sm:h-10" 
                />
                <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400">
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
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 top-5 opacity-20 rounded-full"></div>
              
              <div className="flex justify-between items-center relative">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        currentStep >= step 
                          ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white shadow-lg' 
                          : 'bg-gray-200 text-gray-400 border border-gray-300'
                      } relative z-10`}
                    >
                      {step === 1 ? <FaUser className="text-sm" /> : step === 2 ? <FaLink className="text-sm" /> : <FaChartLine className="text-sm" />}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${currentStep >= step ? 'text-gray-700' : 'text-gray-400'}`}>
                      {step === 1 ? 'Profile' : step === 2 ? 'Links' : 'Finish'}
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
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 p-1 flex items-center justify-center overflow-hidden shadow-lg">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        {formData.profile_picture ? (
                          <div className="relative w-full h-full">
                            <img
                              src={profilePictureUrl || URL.createObjectURL(formData.profile_picture)}
                              alt="Profile"
                              className="w-full h-full object-cover rounded-full"
                            />
                            {isUploadingPicture && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                <LoadingScreen compact />
                              </div>
                            )}
                          </div>
                        ) : (
                          <FaUser size={40} className="text-orange-400" />
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-gradient-to-r from-orange-400 to-amber-500 text-white p-2 rounded-full hover:from-orange-400 hover:to-amber-400 transition-colors shadow-lg"
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
                    className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm transition-all duration-200"
                    placeholder="doejohn999"
                    value={formData.username}
                    onChange={e => {
                      const value = e.target.value.replace(/\s/g, '');
                      setFormData(prev => ({ ...prev, username: value }));
                    }}
                  />
                  <p className="text-xs text-amber-500 mt-1 font-medium">⚠️ Username cannot be changed later.</p>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm transition-all duration-200 resize-none"
                    placeholder="Write a crisp bio within 160 characters"
                    value={formData.bio}
                    onChange={handleInputChange}
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/160 characters</p>
                </div>
              </div>
            )}

            {/* Step 2: Links */}
            {currentStep === 2 && (
              <div className="space-y-6 relative z-10">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Your Links</label>
                  <p className="text-xs text-gray-500 mb-4">You can add up to 5 links</p>
                  <div className="space-y-3">
                    {formData.links.map((link, index) => (
                      <div key={index} className="space-y-2">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                          className="w-full rounded-lg px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm transition-all duration-200"
                          placeholder="Link Title (e.g., My Website)"
                        />
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                            className="flex-1 rounded-lg px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm transition-all duration-200"
                            placeholder="https://example.com"
                          />
                          {formData.links.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLink(index)}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              <FaTrash size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {formData.links.length < 5 && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, links: [...prev.links, { title: '', url: '' }] }))}
                        className="mt-3 flex items-center gap-2 text-orange-400 hover:text-orange-500 transition-colors text-sm font-medium"
                      >
                        <FaPlus size={12} />
                        Add another link
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Final Step */}
            {currentStep === 3 && (
              <div className="space-y-6 text-center relative z-10">
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/40">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-orange-500 flex items-center justify-center">
                    <FaChartLine size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">You're All Set!</h3>
                  <p className="text-gray-600 mb-4">
                    Your Clinkr profile is ready to go. Start tracking your link metrics and grow your online presence.
                  </p>
                  <div className="py-3">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 rounded-full">
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
                  className="flex-1 py-3 px-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNextStep}
                disabled={isLoading || !isStepValid}
                className={`flex-1 py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-br from-orange-400 via-amber-500 to-orange-400 hover:from-orange-500 hover:via-amber-500 hover:to-orange-500 active:from-orange-500 active:via-amber-500 active:to-orange-500 shadow-lg hover:shadow-xl active:shadow-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-400/50 focus:ring-offset-2 ${
                  isLoading ? 'opacity-100' : ''
                } disabled:opacity-100 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden`}
                style={{
                  boxShadow: isLoading || !isStepValid 
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
                    : '0 10px 15px -3px rgba(249, 115, 22, 0.4), 0 4px 6px -2px rgba(249, 115, 22, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                
                {/* Button content */}
                <span className="relative z-10">
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <LoadingScreen compact />
                      Processing...
                    </span>
                  ) : (
                    <span className="font-semibold">
                      {currentStep < 3 ? 'Next' : 'Get Started'}
                    </span>
                  )}
                </span>
                
                {/* Animated background shine effect */}
                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 hover:animate-shine transition-opacity duration-300"></div>
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