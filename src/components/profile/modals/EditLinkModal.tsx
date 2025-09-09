import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { supabase } from '../../../lib/supabaseClient';

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  editLinkData: { url: string; title: string };
  onSave: (updatedLinks: string[], updatedTitles: string[]) => void;
  onError: (error: string) => void;
  getCurrentUserId: () => Promise<string | null>;
  profile: { links: string[]; link_title: string[] } | null;
  editLinkIndex: number | null;
}

const EditLinkModal = ({
  isOpen,
  onClose,
  editLinkData: initialData,
  onSave,
  onError,
  getCurrentUserId,
  profile,
  editLinkIndex
}: EditLinkModalProps) => {
  const [editLinkData, setEditLinkData] = useState({ url: '', title: '' });
  const [editLinkError, setEditLinkError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Update local state when initial data changes
  useEffect(() => {
    setEditLinkData(initialData);
    setEditLinkError(null);
  }, [initialData, isOpen]);

  const handleSave = async () => {
    if (!editLinkData.url || !editLinkData.title) {
      setEditLinkError('Please enter both URL and title.');
      return;
    }

    if (!profile || editLinkIndex === null) {
      setEditLinkError('Invalid link data.');
      return;
    }

    setLoading(true);
    setEditLinkError(null);

    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('No user found');

      const updatedLinks = [...profile.links];
      const updatedLinkTitles = [...profile.link_title];
      updatedLinks[editLinkIndex] = editLinkData.url;
      updatedLinkTitles[editLinkIndex] = editLinkData.title;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ links: updatedLinks, link_title: updatedLinkTitles })
        .eq('id', userId);

      if (updateError) throw updateError;

      onSave(updatedLinks, updatedLinkTitles);
      onClose();
    } catch (err: any) {
      setEditLinkError(err.message || 'Failed to update link');
      onError(err.message || 'Failed to update link');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEditLinkData({ url: '', title: '' });
    setEditLinkError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      ariaHideApp={false}
      style={{ overlay: { zIndex: 1000 } }}
    >
      <div className="flex flex-col items-center p-4 bg-white rounded-lg">
        <h2 className="mb-2 font-bold text-gray-900">Edit Link</h2>
        
        <input
          type="text"
          value={editLinkData.url}
          onChange={e => setEditLinkData(prev => ({ ...prev, url: e.target.value }))}
          placeholder="Edit link URL"
          className="border rounded-md p-2 w-full mb-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] hover:border-[#4F46E5]"
          disabled={loading}
        />
        
        <input
          type="text"
          value={editLinkData.title}
          onChange={e => setEditLinkData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Edit link title"
          className="border rounded-md p-2 w-full mb-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] hover:border-[#4F46E5]"
          disabled={loading}
        />
        
        {editLinkError && (
          <span className="text-xs text-red-500 mb-2">{editLinkError}</span>
        )}
        
        <div className="flex gap-2 mt-2">
          <button 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={
              'px-4 py-2 rounded text-white font-bold bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 shadow ' +
              (loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-orange-500 hover:via-amber-500 hover:to-orange-600 transition-all duration-300')
            }
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditLinkModal;
