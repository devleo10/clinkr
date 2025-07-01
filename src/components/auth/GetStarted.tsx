import { useEffect, useState } from "react";
import logo from "../../assets/Frame.png";
import { Link, useNavigate } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "../../lib/supabaseClient";
import { getRedirectUrl } from "../../lib/urlUtils";
import { useAuth } from "../auth/AuthProvider";
import AuthBackground from "./AuthBackground";

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
      <AuthBackground />
      
      <div className="max-w-md w-full space-y-8 glass-card rounded-xl p-8 relative z-10">
        <div className="text-center">
          <Link to="/homepage" className="inline-block transform hover:scale-105 transition-transform duration-200">
            <img src={logo} alt="Clinkr Logo" className="mx-auto h-12 w-auto cursor-pointer" />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Welcome to Clinkr
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Create your account and start tracking your link metrics
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="text-center text-red-300 text-sm bg-red-900/20 p-2 rounded-md border border-red-500/30">
              {error}
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 backdrop-blur-sm bg-blue-900/30 text-white/70 rounded-md">Continue with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 glass-button rounded-md shadow-lg text-sm font-medium text-white disabled:opacity-50 transform hover:scale-105 transition-all duration-200"
              >
                <FcGoogle size={20} className="filter drop-shadow"/>
                <span className="ml-2">Google</span>
              </button>
              <button
                onClick={handleGitHubSignIn}
                disabled={loading}
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 rounded-md shadow-lg text-sm font-medium text-white disabled:opacity-50 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 transform hover:scale-105 transition-all duration-200"
              >
                <FaGithub size={20} className="filter drop-shadow"/>
                <span className="ml-2">GitHub</span>
              </button>
            </div>
          </div>
        
          <div className="text-center mt-6">
            <p className="text-sm text-white/60">
              By signing up, you agree to our{" "}
              <Link to="/terms" className="text-white hover:text-blue-200 underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-white hover:text-blue-200 underline">
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