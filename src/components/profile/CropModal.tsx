import { useState } from 'react';
import Cropper from 'react-easy-crop';
import Modal from 'react-modal';
import { supabase } from '../../lib/supabaseClient';
import LogoBars from '../ui/LogoBars';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImage: File | null;
  onSuccess: (publicUrl: string) => void;
  onError: (error: string) => void;
  getCurrentUserId: () => Promise<string | null>;
  profile?: { profile_picture?: string | null };
}

// Helper to get cropped image blob
async function getCroppedImg(imageSrc: string, crop: any) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');
  canvas.width = crop.width;
  canvas.height = crop.height;
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas is empty'));
    }, 'image/png');
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

const CropModal = ({ 
  isOpen, 
  onClose, 
  selectedImage, 
  onSuccess, 
  onError, 
  getCurrentUserId, 
  profile 
}: CropModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCropAndUpload = async () => {
    if (!selectedImage || !croppedAreaPixels) return;
    
    setLoading(true);
    try {
      const imageSrc = URL.createObjectURL(selectedImage);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('No user found');

      // Remove previous profile picture if exists
      if (profile?.profile_picture) {
        try {
          const previousFilePath = new URL(profile.profile_picture).pathname.replace(/^\/storage\/v1\/object\/public\/user-data\//, '');
          await supabase.storage.from('user-data').remove([previousFilePath]);
        } catch (e) { /* ignore */ }
      }

      // Upload new image
      const filePath = `avatars/${userId}-${Date.now()}.png`;
      const { data, error } = await supabase.storage.from('user-data').upload(filePath, croppedBlob, { 
        cacheControl: '3600', 
        upsert: true 
      });
      
      if (error) {
        onError('Upload failed: ' + error.message);
        setLoading(false);
        return;
      }

      // Get public URL
      let publicUrl = '';
      if (data && data.path) {
        const { data: urlData } = supabase.storage.from('user-data').getPublicUrl(data.path);
        publicUrl = urlData.publicUrl;
      } else {
        const { data: urlData } = supabase.storage.from('user-data').getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      if (!publicUrl) {
        onError('Failed to get public URL for uploaded image.');
        setLoading(false);
        return;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture: publicUrl })
        .eq('id', userId);
        
      if (updateError) {
        onError('Failed to update profile: ' + updateError.message);
        setLoading(false);
        return;
      }

      onSuccess(publicUrl);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        onError(err.message || 'Failed to update profile picture.');
      } else {
        onError('Failed to update profile picture.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      style={{ overlay: { zIndex: 1000 } }}
    >
      <div className="flex flex-col items-center p-4">
        <h2 className="mb-2 font-bold">Crop your profile picture</h2>
        {selectedImage && (
          <div className="relative w-64 h-64 bg-gray-100">
            <Cropper
              image={URL.createObjectURL(selectedImage)}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_: any, croppedAreaPixels: any) => setCroppedAreaPixels(croppedAreaPixels)}
            />
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <button 
            className="px-4 py-2 bg-gray-200 rounded" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={
              'px-4 py-2 rounded text-white font-bold bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 shadow ' +
              (loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-orange-500 hover:via-amber-500 hover:to-orange-600 transition-all duration-300')
            }
            onClick={handleCropAndUpload}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <LogoBars size={20} color="#FB923C" reducedMotion={false} />
                Uploading...
              </span>
            ) : (
              'Crop & Upload'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CropModal;
