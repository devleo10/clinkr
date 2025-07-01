
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/Frame.png';
import AuthBackground from './AuthBackground';

const PasswordReset = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement password reset API call
      // toast.success('Password reset link sent to your email');
      navigate('/login');
    } catch (error) {
      // toast.error('Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <AuthBackground />
      
      <div className="max-w-md w-full space-y-8 glass-card rounded-xl p-8 relative z-10">
        <div className="text-center">
          <Link to="/" className="inline-block transform hover:scale-105 transition-transform duration-200">
            <img src={logo} alt="ClipMetrics Logo" className="mx-auto h-12 w-auto" />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 glass-input text-white placeholder-white/60 focus:outline-none focus:ring-white/30 focus:border-white/50 sm:text-sm"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transform hover:scale-105 transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className="text-center text-sm">
            <Link
              to="/login"
              className="font-medium text-white hover:text-blue-200 underline transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;