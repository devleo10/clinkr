import { useEffect, useState } from "react";
import logo from "../../assets/Frame.png";
import { Link, useNavigate } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "../../lib/supabaseClient";
import { getRedirectUrl } from "../../lib/urlUtils";
import { useAuth } from "../auth/AuthProvider";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
          <Link to="/homepage">
            <img src={logo} alt="Clinkr Logo" className="mx-auto h-12 w-auto cursor-pointer" />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500">
            Welcome to Clinkr
          </h2>
          </div>
         

          <div className="mt-8 space-y-6">
         
         
        

          {error && (
            <div className="text-center text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Continue with</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
               onClick={handleGoogleSignIn}
               disabled={loading}
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <FcGoogle size={20}/>
                <span className="ml-2">Google</span>
              </button>
              <button
              onClick={handleGitHubSignIn}
              disabled={loading}
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-[#24292E] text-sm font-medium text-white hover:bg-[#1b1f23df]"
              >
                <FaGithub size={20} />
                <span className="ml-2">GitHub</span>
              </button>
            </div>
          </div>
      
      </div>
      </div>
    </div>
  );
};

export default GetStarted