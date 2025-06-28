import { useState, useEffect, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { FaChartLine } from 'react-icons/fa';
import Navbar from './Navbar';
import Cards from './cards/Cards';
import LinkDatas from './LinkDatas';
import { motion } from 'framer-motion';
import Upgrade from './cards/Upgrade';
import debounce from 'lodash/debounce';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../auth/AuthProvider';

const DashBoard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [profileChecked, setProfileChecked] = useState(false);
  const [profileValid, setProfileValid] = useState(false);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedSearchQuery(query);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const { session } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const checkProfile = async () => {
      if (!session?.user?.id) {
        setProfileChecked(true);
        setProfileValid(false);
        return;
      }
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();
      if (error || !profile?.username) {
        navigate('/onboarding');
      } else {
        setProfileValid(true);
      }
      setProfileChecked(true);
    };
    checkProfile();
  }, [session, navigate]);

  if (!profileChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  if (!profileValid) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          {/* Analytics Dashboard Heading */}
          <div className="flex flex-col items-center mb-6">
            <h1 className="font-bold text-2xl sm:text-3xl text-gray-800 text-center">
              Analytics Dashboard
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search links..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex items-center space-x-4">
            
              <div className="flex items-center space-x-4">
                <Link to="/premiumdashboard">
                  <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 text-white transition-all duration-300">
                    <p className='font-bold text-center'>Check Premium Analytics</p>
                    <FaChartLine size={20} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Cards />
        </motion.div>
        <motion.div
          initial={{ x: -50 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
  className="mb-8"
>
  <LinkDatas searchQuery={debouncedSearchQuery} />
</motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Upgrade />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashBoard;