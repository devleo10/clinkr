import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import logo from '../../assets/Frame.png';
import { FaUser, FaLink, FaChartLine, FaCamera } from 'react-icons/fa';
import Footer from '../homepage/Footer';
import { supabase } from '../../lib/supabaseClient';

const Onboarding = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isStepValid, setIsStepValid] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',  // Updated to match UserProfile interface
    username: '',
    bio: '',
    profile_picture: null as File | null,  // Updated to match UserProfile interface
    links: [''] as string[], // Initialize with one empty link
    link_titles: [''] as string[] // Initialize with one empty title
  });

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
          formData.full_name.trim() !== '' &&
          formData.username.trim() !== '' &&
          formData.bio.trim().length <= 160 // Limit bio to 160 characters
        );
        break;
      case 2:
        setIsStepValid(formData.links.length > 0 && formData.links.every(link => link.trim() !== ''));
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
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setFormData(prev => ({
        ...prev,
        profile_picture: file // Ensure this matches the state key
      }));
    }
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
  
      // Upload profile picture if exists
      let profilePictureUrl = null;
      if (formData.profile_picture) {
        const fileExt = formData.profile_picture.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
        try {
          console.log('Attempting to upload profile picture...');
          
          // First, ensure the bucket exists and has correct policies
          const { error: bucketError } = await supabase
            .storage
            .createBucket('user-data', {
              public: true,
              allowedMimeTypes: ['image/*'],
              fileSizeLimit: 5 * 1024 * 1024 // 5MB
            });
  
          // Ignore error if bucket already exists
          if (bucketError && !bucketError.message.includes('already exists')) {
            throw bucketError;
          }
  
          // Now upload the file
          const { error: uploadError } = await supabase.storage
            .from('user-data')
            .upload(fileName, formData.profile_picture, {
              cacheControl: '3600',
              upsert: false
            });
  
          if (uploadError) throw uploadError;
  
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('user-data')
            .getPublicUrl(fileName);
  
          profilePictureUrl = publicUrl;
          console.log('Profile picture uploaded successfully:', publicUrl);
        } catch (storageError: any) {
          console.error('Storage operation failed:', storageError);
          throw new Error(`Failed to upload profile picture: ${storageError.message}`);
        }
      }
  
      // Save profile data with RLS handling
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          profile_picture: profilePictureUrl,
          links: formData.links,
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
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-md w-full space-y-8">
          {/* Updated Header Section */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <img 
                src={logo} 
                alt="Clinkr Logo" 
                className="h-8 w-auto sm:h-10" 
              />
              <h1 className="text-3xl sm:text-4xl font-extrabold relative group">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500">
                  Clinkr
                </span>
              </h1>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Welcome to Clinkr
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Let's set up your account to get the most out of Clinkr
            </p>
          </div>

          {/* Updated Progress Indicator */}
          <div className="relative mb-8">
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 top-5 opacity-20"></div>
            
            <div className="flex justify-between items-center relative">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep >= step 
                        ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    } relative z-10`}
                  >
                    {step === 1 ? <FaUser /> : step === 2 ? <FaLink /> : <FaChartLine />}
                  </div>
                  <span className="text-xs mt-2 text-gray-500">
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
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {formData.profile_picture ? (
                      <img
                        src={URL.createObjectURL(formData.profile_picture)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser size={40}  />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-[#4F46E5] text-white p-2 rounded-full hover:bg-[#4338CA] transition-colors"
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
                <p className="text-sm text-gray-500">Upload a profile picture</p>
              </div>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  id="fullName"
                  name="full_name" // Update this to match the formData key
                  type="text"
                  required
                  className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#4F46E5] focus:border-[#4F46E5] focus:z-10 sm:text-sm"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#4F46E5] focus:border-[#4F46E5] focus:z-10 sm:text-sm"
                  placeholder="doejohn999"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#4F46E5] focus:border-[#4F46E5] focus:z-10 sm:text-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Your Links</label>
                <p className="text-xs text-gray-500 mb-4">You can add up to 5 links</p>
                <div className="space-y-2">
                  {formData.links.map((link, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={link}
                        onChange={(e) => {
                          const newLinks = [...formData.links];
                          newLinks[index] = e.target.value;
                          setFormData(prev => ({ ...prev, links: newLinks }));
                        }}
                        className="flex-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#4F46E5] focus:border-[#4F46E5] focus:z-10 sm:text-sm"
                        placeholder="https://example.com"
                      />
                      <input
                        type="text"
                        value={formData.link_titles[index]}
                        onChange={(e) => {
                          const newTitles = [...formData.link_titles];
                          newTitles[index] = e.target.value;
                          setFormData(prev => ({ ...prev, link_titles: newTitles }));
                        }}
                        className="flex-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#4F46E5] focus:border-[#4F46E5] focus:z-10 sm:text-sm"
                        placeholder="Link Title"
                      />
                      {formData.links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newLinks = formData.links.filter((_, i) => i !== index);
                            const newTitles = formData.link_titles.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, links: newLinks, link_titles: newTitles }));
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.links.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, links: [...prev.links, ''], linkTitles: [...prev.link_titles, ''] }))}
                      className="mt-2 text-[#4F46E5] hover:text-[#4338CA]"
                    >
                      Add another link
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Final Step */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">You're All Set!</h3>
                <p className="text-gray-600 mb-4">
                  Your Clinkr profile is ready to go. Start tracking your link metrics and grow your online presence.
                </p>
                <div className="flex justify-center text-indigo-600">
                  <FaChartLine size={24} className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"/>
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
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNextStep}
              disabled={isLoading || !isStepValid}
              className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ? 'opacity-75' : ''
              } disabled:opacity-50 disabled:cursor-not-allowed`}
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
      <Footer />
    </div>
  );
};

export default Onboarding;