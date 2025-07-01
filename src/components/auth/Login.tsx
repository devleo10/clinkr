import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import logo from '../../assets/Frame.png';
import { supabase } from '../../lib/supabaseClient';
import { getRedirectUrl } from '../../lib/urlUtils';
import AuthBackground from './AuthBackground';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGitHubSignIn = async () => {
    setError(null);
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: getRedirectUrl('/onboarding')
      }
    });
    if (oauthError) {
      setError(oauthError.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl('/privateprofile')
      }
    });
    if (oauthError) {
      setError(oauthError.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <AuthBackground />
      
      <div className="max-w-md w-full space-y-8 glass-card rounded-xl p-8 relative z-10">
        <div className="text-center">
          <Link to="/" className="inline-block transform hover:scale-105 transition-transform duration-200">
            <img src={logo} alt="ClipMetrics Logo" className="mx-auto h-12 w-auto cursor-pointer" />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-white hover:text-blue-200 underline transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="text-center">
            <p className="text-sm text-white/80 mb-4">Sign in with your social account</p>
          </div>        

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
      
        </div>
      </div>
    </div>
  );
};

export default Login;