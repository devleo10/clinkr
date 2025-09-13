import { FaUser, FaTrash, FaShare } from 'react-icons/fa';
import { Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { validateImageFile } from '../../../lib/imageCompression';

interface ProfileHeaderProps {
  profile: any;
  loading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  setLoading: (loading: boolean) => void;
  setProfile: (cb: (prev: any) => any) => void;
  getCurrentUserId: () => Promise<string | null>;
  setSelectedImage: (file: File | null) => void;
  setCropModalOpen: (open: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleShareProfile: () => void;
  showToast: boolean;
  toastMessage: string;
  setEditedBio: (bio: string) => void;
  editState: { bio: boolean };
  setEditState: (cb: (prev: any) => any) => void;
  editedBio: string;
  handleBioUpdate: () => void;
}

const ProfileHeader = ({
  profile,
  loading,
  error,
  setError,
  setLoading,
  setProfile,
  getCurrentUserId,
  setSelectedImage,
  setCropModalOpen,
  fileInputRef,
  handleShareProfile,
  showToast,
  toastMessage,
  setEditedBio,
  editState,
  setEditState,
  editedBio,
  handleBioUpdate
}: ProfileHeaderProps) => {
  return (
    <div className="text-center relative bg-white rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm">
      {/* Profile Picture Section */}
      <div className="w-32 h-32 mx-auto rounded-full p-1 flex items-center justify-center mb-4 relative shadow-sm border border-gray-100 bg-white group">
        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-transparent z-20">
              {/* Loading spinner or screen */}
            </div>
          )}
          {profile?.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt={profile.username}
              className="w-full h-full object-cover rounded-full transition-transform duration-200 group-hover:scale-105"
              style={{ filter: loading ? 'blur(2px)' : 'none', background: 'transparent' }}
            />
          ) : (
            <FaUser size={60} className="text-orange-200" />
          )}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-full">
          <button
            type="button"
            onClick={() => { if (fileInputRef.current) { fileInputRef.current.value = ''; fileInputRef.current.click(); } }}
            className="mb-2 flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium border border-gray-200"
            aria-label="Update profile picture"
            disabled={loading}
          >
            <Edit size={14} /> Update
          </button>
          {profile?.profile_picture && !loading && (
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const userId = await getCurrentUserId();
                  if (!userId) throw new Error('No user found');
                  const previousFilePath = new URL(profile.profile_picture as string).pathname.replace(/^\/storage\/v1\/object\/public\/user-data\//, '');
                  await import('../../../lib/supabaseClient').then(({ supabase }) =>
                    supabase.storage.from('user-data').remove([previousFilePath])
                  );
                  const { error: updateError } = await import('../../../lib/supabaseClient').then(({ supabase }) =>
                    supabase.from('profiles').update({ profile_picture: null }).eq('id', userId)
                  );
                  if (updateError) throw updateError;
                  setProfile((prev: any) => prev ? { ...prev, profile_picture: null } : null);
                } catch (err: any) {
                  setError(err.message || 'Failed to delete profile picture.');
                } finally {
                  setLoading(false);
                }
              }}
              className="mb-3 flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium border border-red-100"
              aria-label="Delete profile picture"
              disabled={loading}
            >
              <FaTrash size={13} /> Delete
            </button>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            
            // Validate the image file first
            const validation = validateImageFile(file, 10); // 10MB max
            if (!validation.isValid) {
              setError(validation.error || 'Invalid image file');
              e.target.value = '';
              return;
            }
            
            setSelectedImage(file);
            setCropModalOpen(true);
            e.target.value = '';
          }}
        />
      </div>
      <p className="text-orange-400 mb-2 font-medium">@{profile?.username}</p>
      <div className="relative inline-block">
        {editState.bio ? (
          <div className="mt-2">
            <textarea
              value={editedBio}
              onChange={(e) => {
                if (e.target.value.length <= 160) setEditedBio(e.target.value);
              }}
              className="w-full p-2 border rounded-md focus:ring-[#4F46E5] focus:border-transparent"
              placeholder="Write your bio..."
              rows={3}
              maxLength={160}
            />
            <div className="text-xs text-gray-500 text-right mt-1">{editedBio.length}/160</div>
            <button
              onClick={handleBioUpdate}
              className="mt-2 px-4 py-2 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 text-white rounded-md font-bold shadow hover:from-orange-400 hover:via-amber-500 hover:to-orange-400 transition-all duration-300"
            >
              Save Bio
            </button>
          </div>
        ) : (
          <div className="group relative inline-block">
            <p className="text-gray-600 mt-2">{profile?.bio}</p>
            <button
              onClick={() => {
                setEditedBio(profile?.bio || '');
                setEditState((prev: any) => ({ ...prev, bio: true }));
              }}
              className="absolute -right-6 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit bio"
            >
              <Edit size={12} />
            </button>
          </div>
        )}
        <div className="flex flex-col items-center justify-center gap-2 mb-2">
          <motion.div 
            className="mb-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 border border-indigo-200 shadow text-indigo-700 font-semibold text-center"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span role="img" aria-label="star">⭐</span> Share your unique Link-in-Bio with the world!
          </motion.div>
          <button
            onClick={handleShareProfile}
            className="inline-flex items-center gap-1 px-4 py-2 text-base font-bold text-white bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 rounded-lg shadow-lg hover:from-orange-400 hover:via-amber-500 hover:to-orange-400 transition-all duration-300 border-2 border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          >
            <FaShare size={16} />
            Get Your Link-in-Bio link
          </button>
          {showToast && (
            <div className="fixed left-1/2 bottom-4 -translate-x-1/2 flex justify-center items-center w-full pointer-events-none z-50">
              <div className="bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out pointer-events-auto">
                {toastMessage || 'Link copied to clipboard!'}
              </div>
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-600 text-xs py-1 px-2 rounded-md whitespace-nowrap z-30">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
