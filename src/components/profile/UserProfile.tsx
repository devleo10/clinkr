import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardContent } from '../ui/card';
import { FaUser, FaLink } from 'react-icons/fa';

interface UserProfileData {
  full_name: string;
  username: string;
  bio: string;
  profile_picture: string | null;
  links: string[];
  link_titles: string[];
}

const UserProfile = () => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .single();

        if (error) throw error;

        const profileData: UserProfileData = {
          full_name: data.full_name || '',
          username: data.username || '',
          bio: data.bio || '',
          profile_picture: data.profile_picture,
          links: Array.isArray(data.links) ? data.links : (data.links ? JSON.parse(data.links) : []),
          link_titles: Array.isArray(data.link_titles) ? data.link_titles : (data.link_titles ? JSON.parse(data.link_titles) : []),
        };

        setProfile(profileData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
          {profile?.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt={profile.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <FaUser size={40} />
          )}
        </div>
        <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
        <p className="text-gray-600">@{profile?.username}</p>
        <p className="text-gray-600 mt-2">{profile?.bio}</p>
      </div>

      <div className="mt-6 space-y-4 max-w-md mx-auto">
        {profile?.links.map((link, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-xl text-gray-600 flex-shrink-0"><FaLink /></span>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-[#4F46E5] transition-colors truncate"
                >
                  {profile.link_titles[index] || link}
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;