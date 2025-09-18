import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  hasProfile: boolean | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  hasProfile: null,
  refreshProfile: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const profileCheckRef = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      
      // Check if user has a profile
      if (session?.user?.id) {
        checkProfile(session.user.id);
      } else {
        setHasProfile(false);
        profileCheckRef.current = null;
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      setSession(session);
      
      // Only check profile if this is a new user or if we don't have profile data yet
      if (session?.user?.id && profileCheckRef.current !== session.user.id) {
        checkProfile(session.user.id);
      } else if (!session?.user?.id) {
        setHasProfile(false);
        profileCheckRef.current = null;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkProfile = async (userId: string) => {
    // Prevent duplicate checks for the same user
    if (profileCheckRef.current === userId) {
      return;
    }
    
    profileCheckRef.current = userId;
    
    try {
      // First verify the user still exists in auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user || user.id !== userId) {
        console.log('User no longer exists in auth, clearing session');
        await supabase.auth.signOut();
        setSession(null);
        setHasProfile(false);
        profileCheckRef.current = null;
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      const profileExists = !!profile?.username;
      console.log('Profile check result:', profileExists, 'for user:', userId);
      setHasProfile(profileExists);
    } catch (error) {
      console.error('Error checking profile:', error);
      setHasProfile(false);
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      // Reset the ref to force a fresh check
      profileCheckRef.current = null;
      await checkProfile(session.user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ session, loading, hasProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);