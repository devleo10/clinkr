import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import logo from '../../assets/Frame.png';
import { FaUser, FaLink, FaChartLine, FaCamera } from 'react-icons/fa';
import Footer from '../homepage/Footer';
import { supabase } from '../../lib/supabaseClient';
import LinkValidator from '../../lib/link-validator';

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
        navigate('/signup');
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
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-blue-900 to-purple-900 opacity-90"></div>
        
        {/* Animated wave effect */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path 
              d="M 0 200 C 300 100 600 300 1200 200 L 1200 600 L 0 600 Z" 
              fill="url(#wave1)" 
              className="animate-wave-slow"
            />
            <defs>
              <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Accent circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500 mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-purple-500 mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
        <div className="max-w-md w-full space-y-8 glass-card rounded-xl p-8">
          {/* Updated Header Section */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <img 
                src={logo} 
                alt="Clinkr Logo" 
                className="h-8 w-auto sm:h-10 filter drop-shadow" 
              />
              <h1 className="text-3xl sm:text-4xl font-extrabold relative group">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                  Clinkr
                </span>
              </h1>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-white">
              Welcome to Clinkr
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Let's set up your account to get the most out of Clinkr
            </p>
          </div>

          {/* Updated Progress Indicator */}
          <div className="relative mb-8">
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 top-5 opacity-20"></div>
            
            <div className="flex justify-between items-center relative">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep >= step 
                        ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg' 
                        : 'bg-gray-800/50 text-gray-400 border border-gray-700'
                    } relative z-10`}
                  >
                    {step === 1 ? <FaUser className="filter drop-shadow" /> : step === 2 ? <FaLink className="filter drop-shadow" /> : <FaChartLine className="filter drop-shadow" />}
                  </div>
                  <span className={`text-xs mt-2 ${currentStep >= step ? 'text-white' : 'text-gray-400'}`}>
                    {step === 1 ? 'Profile' : step === 2 ? 'Links' : 'Finish'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Basic Profile */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-blue-900/30 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden shadow-lg">
                    {formData.profile_picture ? (
                      <div className="relative w-32 h-32">
                        <img
                          src={profilePictureUrl || URL.createObjectURL(formData.profile_picture)}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                        {isUploadingPicture && (
                          <div className="absolute inset-0 flex items-center justify-center bg-blue-900/60 rounded-full backdrop-blur-sm">
                            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    ) : (
                      <FaUser size={40} className="text-white/70" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-2 rounded-full hover:from-indigo-500 hover:to-blue-400 transition-colors shadow-lg"
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
                <p className="text-sm text-white/80">Upload a profile picture</p>
              </div>
            
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white/90">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 glass-input text-white placeholder-white/60 focus:outline-none focus:ring-white/30 focus:border-white/50 sm:text-sm"
                  placeholder="doejohn999"
                  value={formData.username}
                  onChange={e => {
                    const value = e.target.value.replace(/\s/g, '');
                    setFormData(prev => ({ ...prev, username: value }));
                  }}
                />
                <p className="text-xs text-yellow-300/80 mt-1">Warning: Username cannot be changed later.</p>
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-white/90">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 glass-input text-white placeholder-white/60 focus:outline-none focus:ring-white/30 focus:border-white/50 sm:text-sm"
                  placeholder="Write a crisp bio within 160 words"
                  value={formData.bio}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {/* Step 2: Links */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Add Your Links</label>
                <p className="text-xs text-white/70 mb-4">You can add up to 5 links</p>
                <div className="space-y-2">
                  {formData.links.map((link, index) => (
                    <div key={index} className="flex flex-col gap-1 mb-2">
                      <LinkValidator url={link.url}>
                        {(isValid, message) => (
                          <>
                            <input
                              type="text"
                              value={link.url}
                              onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                              className={`flex-1 rounded-lg px-3 py-2 glass-input ${!isValid && link.url ? "border-red-500" : "border-white/30"} text-white placeholder-white/60 focus:outline-none focus:ring-white/30 focus:border-white/50 sm:text-sm`}
                              placeholder="https://example.com"
                            />
                            {!isValid && link.url && (
                              <span className="text-xs text-red-300">{message}</span>
                            )}
                          </>
                        )}
                      </LinkValidator>
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                        className="flex-1 rounded-lg px-3 py-2 glass-input border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-white/30 focus:border-white/50 sm:text-sm"
                        placeholder="Link Title"
                      />
                      {formData.links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));
                          }}
                          className="ml-2 text-red-300 hover:text-red-200 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.links.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, links: [...prev.links, { title: '', url: '' }] }))}
                      className="mt-2 text-white/90 hover:text-blue-200 transition-colors flex items-center gap-1"
                    >
                      <span className="text-lg">+</span> Add another link
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Final Step */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center">
              <div className="glass-card p-6 rounded-lg shadow-lg border border-white/30 backdrop-blur-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <FaChartLine size={28} className="text-white filter drop-shadow" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">You're All Set!</h3>
                <p className="text-white/80 mb-4">
                  Your Clinkr profile is ready to go. Start tracking your link metrics and grow your online presence.
                </p>
                <div className="py-3">
                  <div className="w-full h-2 bg-blue-900/30 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-blue-400 to-indigo-500 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Updated Navigation Buttons */}
          <div className="flex justify-between mt-8 gap-4">
            {currentStep > 1 && (
              <button
                onClick={handlePrevStep}
                disabled={isLoading}
                className="flex-1 py-2 px-4 glass-button rounded-md shadow-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 duration-200"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNextStep}
              disabled={isLoading || !isStepValid}
              className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/30 ${
                isLoading ? 'opacity-75' : ''
              } disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105`}
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                currentStep < 3 ? 'Next' : 'Get Started'
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Onboarding;