import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export interface UserProfile {
  username: string;
  bio: string;
  profile_picture: string | null;
  id: string;
}

export function useProfile(username?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  const getCurrentUserId = async () => {
    if (userIdRef.current) return userIdRef.current;
    const { data: { user } } = await supabase.auth.getUser();
    userIdRef.current = user?.id ?? null;
    return userIdRef.current;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userId = await getCurrentUserId();
        if (!userId) {
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error) throw error;
        setProfile({
          id: data.id,
          username: data.username || '',
          bio: data.bio || '',
          profile_picture: data.profile_picture,
        });
      } catch (err: any) {
        setError(err?.message || 'Failed to load profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  return {
    profile,
    setProfile,
    loading,
    setLoading,
    error,
    setError,
    getCurrentUserId
  };
}
