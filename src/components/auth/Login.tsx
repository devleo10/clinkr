// import { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { FaGithub } from 'react-icons/fa';
// import { FcGoogle } from "react-icons/fc";
// import logo from '../../assets/Frame.png';
// import { supabase } from '../../lib/supabaseClient';
// import { getRedirectUrl } from '../../lib/urlUtils';

// const Login = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkAuth = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         navigate('/dashboard');
//       }
//     };
//     checkAuth();
//   }, [navigate]);

 



// const handleGitHubSignIn = async () => {
//     setError(null);
//     setLoading(true);
//     const { error: oauthError } = await supabase.auth.signInWithOAuth({
//       provider: 'github',
//       options: {
//         redirectTo: getRedirectUrl('/onboarding')
//       }
//     });
//     if (oauthError) {
//       setError(oauthError.message);
//     }
//     setLoading(false);
// };

// const handleGoogleSignIn = async () => {
//     setError(null);
//     setLoading(true);
//     const { error: oauthError } = await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         redirectTo: getRedirectUrl('/privateprofile')
//       }
//     });
//     if (oauthError) {
//       setError(oauthError.message);
//     }
//     setLoading(false);
// };


//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8">
//         <div className="text-center">
//           <Link to="/">
//             <img src={logo} alt="ClipMetrics Logo" className="mx-auto h-12 w-auto cursor-pointer" />
//           </Link>
//           <h2 className="mt-6 text-3xl font-bold text-gray-900 text-center">Welcome back</h2>
//           <p className="mt-2 text-sm text-gray-600">
//             Don't have an account?{' '}
//             <Link to="/signup" className="font-medium text-[#4F46E5] hover:text-[#4338CA] underline">
//               Sign up
//             </Link>
//           </p>
//         </div>

//         <div className="mt-8 space-y-6">
//           <div className="text-center">
//             <p className="text-sm text-gray-600 mb-4">Sign in with your social account</p>
//           </div>        

//           <div>
//             <button
//               type="submit"
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4F46E5] hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5] disabled:opacity-50"
//               disabled={loading} // Disable button when loading
//             >
//               {loading ? 'Signing In...' : 'Sign in'}
//             </button>
//           </div>

//           <div className="mt-6">
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-300"></div>
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
//               </div>
//             </div>

//             <div className="mt-6 grid grid-cols-2 gap-3">
//               <button
//                 onClick={handleGoogleSignIn} // Add onClick handler
//                 disabled={loading} // Disable button when loading
//                 type="button"
//                 className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
//               >
//                 <FcGoogle size={20}/>
//                 <span className="ml-2">Google</span>
//               </button>
//               <button
//                 onClick={handleGitHubSignIn} // Add onClick handler
//                 disabled={loading} // Disable button when loading
//                 type="button"
//                 className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-[#24292E] text-sm font-medium text-white hover:bg-[#1b1f23df] disabled:opacity-50"
//               >
//                 <FaGithub size={20} />
//                 <span className="ml-2">GitHub</span>
//               </button>
//             </div>
//           </div>
      
//       </div>
//     </div>
//     </div>
//   );
// };

// export default Login