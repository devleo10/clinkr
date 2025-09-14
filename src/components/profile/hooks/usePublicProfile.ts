import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { ShortLink } from '../../../lib/linkShorteningService';

export interface UserProfile {
  username: string;
  bio: string;
  profile_picture: string | null;
  id: string;
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
        console.log('usePublicProfile: Fetching profile for identifier:', identifier);
        
        // Get the profile by username (identifier is the username)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', identifier)
          .single();
        
        if (profileError) {
          console.error('usePublicProfile: Profile fetch error:', profileError);
          throw profileError;
        }
        
        console.log('usePublicProfile: Profile found:', profileData);
        
        const profile: UserProfile = {
          id: profileData.id,
          username: profileData.username || '',
          bio: profileData.bio || '',
          profile_picture: profileData.profile_picture,
        };
        
        setProfile(profile);
        
        // Get the shortened links for this user
        console.log('usePublicProfile: Fetching links for user_id:', profileData.id);
        const { data: links, error: linksError } = await supabase
          .from('shortened_links')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (linksError) {
          console.error('usePublicProfile: Links fetch error:', linksError);
          setShortLinks([]);
        } else {
          console.log('usePublicProfile: Links found:', links);
          setShortLinks(links || []);
        }
        
      } catch (err: any) {
        console.error('usePublicProfile: Error:', err);
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
