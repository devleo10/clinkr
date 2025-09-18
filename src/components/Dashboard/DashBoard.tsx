
import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaChartLine, FaCrown } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Cards from './cards/Cards';
import LinkDatas from './LinkDatas';
import LinkManagement from './LinkManagement';
import { motion } from 'framer-motion';
import Upgrade from './cards/Upgrade';
import debounce from 'lodash/debounce';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../auth/AuthProvider';
import BoltBackground from '../homepage/BoltBackground';
import LoadingScreen from '../ui/loadingScreen';
import { DashboardDataProvider } from './DashboardDataContext';

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
    return <LoadingScreen />;
  }
  if (!profileValid) {
    return null;
  }

  return (
    <DashboardDataProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen relative font-inter text-black"
        style={{ background: 'var(--c-bg)' }}
      >
        <BoltBackground />
        
        <Navbar />
        
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="glass-card bg-white/80 backdrop-blur-lg border border-white/30 p-6 rounded-xl shadow-lg mb-8 relative overflow-hidden"
          style={{ willChange: 'transform' }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white/50 to-orange-100/50 opacity-70" />
          
          {/* Animated accent */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Corner decoration */}
          <motion.div
            className="absolute top-0 right-0 w-16 h-16"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-300 rounded-bl-full" />
          </motion.div>
          
          {/* Analytics Dashboard Heading */}
          <div className="flex flex-col items-center mb-6 relative z-10">
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mr-3 p-2 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 shadow-md">
                <FaChartLine size={24} className="text-orange-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
            </motion.div>
            <motion.p 
              className="text-gray-600 text-center mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Track your link performance and insights
            </motion.p>
            <motion.div
              className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FaCrown size={12} />
              <span>Want deeper insights?</span>
              <Link to="/premiumdashboard" className="font-semibold hover:underline">
                Try Premium Analytics
              </Link>
            </motion.div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <div className="w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search links..."
                className="w-full pl-10 pr-4 py-3 glass-input bg-white/80 backdrop-blur-lg border border-white/50 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-black placeholder-gray-400 transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Cards Grid */}
        <Cards />

        {/* Upgrade Card */}
        <Upgrade />

        {/* Link Management */}
        <LinkManagement userId={session?.user?.id || ''} />

        {/* Link Data Table */}
        <LinkDatas searchQuery={debouncedSearchQuery} />
        </div>
      </motion.div>
    </DashboardDataProvider>
  );
};

export default DashBoard;