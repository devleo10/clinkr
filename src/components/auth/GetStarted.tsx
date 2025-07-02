import { useEffect, useState } from "react";
import logo from "../../assets/Frame.png";
import { Link, useNavigate } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "../../lib/supabaseClient";
import { getRedirectUrl } from "../../lib/urlUtils";
import { useAuth } from "../auth/AuthProvider";
import BoltBackground from "../homepage/BoltBackground";

const GetStarted = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);
  
  // Handle GitHub Sign In
  const handleGitHubSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: getRedirectUrl('/onboarding')
        }
      });
      if (oauthError) throw oauthError;
    } catch (error: any) {
      setError(error.message);
    }
    setLoading(false);
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl('/onboarding'),
        }
      });
      if (oauthError) throw oauthError;
    } catch (error: any) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <BoltBackground/>
      
      <div className="max-w-md w-full space-y-8 bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative z-10">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-70 rounded-xl" />
        
        {/* Animated accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 rounded-t-xl" />
        
        <div className="text-center relative z-10">
          <Link to="/homepage" className="inline-block transform hover:scale-105 transition-transform duration-200">
            <img src={logo} alt="Clinkr Logo" className="mx-auto h-12 w-auto cursor-pointer" />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500">
            Welcome to Clinkr
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account and start tracking your link metrics
          </p>
        </div>

        <div className="mt-8 space-y-6 relative z-10">
          {error && (
            <div className="text-center text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 rounded-md">Continue with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                type="button"
                className="w-full inline-flex justify-center items-center py-3 px-4 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <FcGoogle size={20} />
                <span className="ml-2">Google</span>
              </button>
              
              <button
                onClick={handleGitHubSignIn}
                disabled={loading}
                type="button"
                className="w-full inline-flex justify-center items-center py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <FaGithub size={20} />
                <span className="ml-2">GitHub</span>
              </button>
            </div>
          </div>
        
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              By signing up, you agree to our{" "}
              <Link to="/terms" className="text-indigo-600 hover:text-indigo-500 underline underline-offset-2">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500 underline underline-offset-2">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;