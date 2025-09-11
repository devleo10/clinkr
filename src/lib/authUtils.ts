// Auth State Management Helper
// Add this to your src/lib/authUtils.ts or similar file

import { supabase } from './supabaseClient';

export const clearAuthState = async () => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear all local storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any cookies (if using them)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log('Auth state cleared successfully');
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
};

export const validateUser = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { valid: false, error: 'No valid session' };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { valid: false, error: 'User validation failed' };
    }

    return { valid: true, user, session };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
