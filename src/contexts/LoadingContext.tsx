import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const setLoading = useCallback((loading: boolean, message: string = 'Loading...') => {
    setIsLoading(loading);
    setLoadingMessage(message);
  }, []);

  const showLoading = useCallback((message: string = 'Loading...') => {
    setIsLoading(true);
    setLoadingMessage(message);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <LoadingContext.Provider value={{
      isLoading,
      loadingMessage,
      setLoading,
      showLoading,
      hideLoading
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

