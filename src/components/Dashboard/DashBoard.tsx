
import { useState, useEffect, useCallback } from 'react';
import { FaFilePdf, FaFileCsv, FaSearch } from 'react-icons/fa';
import Navbar from './Navbar';
import Cards from './cards/Cards';
import LinkDatas from './LinkDatas';
import { motion } from 'framer-motion';
import Upgrade from './cards/Upgrade';
import debounce from 'lodash/debounce';
import { exportAnalyticsData } from '../../utils/exportAnalytics';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-hot-toast';

const DashBoard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

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

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to export analytics data');
        return;
      }

      const url = await exportAnalyticsData(user.id, { format });
      
      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
      
      toast.success(`Analytics data exported successfully as ${format.toUpperCase()}!`);
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error.message || 'Failed to export analytics data');
    } finally {
      setIsExporting(false);
    }
  };

 

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
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExport('csv')}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-green-600">
                    <FaFileCsv />
                  </span>
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-red-600">
                    <FaFilePdf />
                  </span>
                  <span>PDF</span>
                </button>
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