import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { ShortLink } from '../../../lib/linkShorteningService';

export interface UserProfile {
  username: string;
  bio: string;
  profile_picture: string | null;
  id: string;
  user_id: string;
}

export function usePublicProfile(identifier: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Fetching profile for identifier
        
        // Get the profile by username (identifier is the username)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', identifier)
          .single();
        
        if (profileError) {
          // Profile fetch error
          throw profileError;
        }
        
        // Profile found
        
        const profile: UserProfile = {
          id: profileData.id,
          user_id: profileData.id, // In profiles table, id is the user_id
          username: profileData.username || '',
          bio: profileData.bio || '',
          profile_picture: profileData.profile_picture,
        };
        
        setProfile(profile);
        
        // Get the shortened links for this user
        // Fetching links for user
        const { data: links, error: linksError } = await supabase
          .from('shortened_links')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (linksError) {
          // Links fetch error
          setShortLinks([]);
        } else {
          // Links found
          setShortLinks(links || []);
        }
        
      } catch (err: any) {
        // Profile hook error
        setError(err?.message || 'Failed to load profile');
        setProfile(null);
        setShortLinks([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (identifier) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [identifier]);

  return {
    profile,
    shortLinks,
    loading,
    error
  };
}
