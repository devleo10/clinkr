/**
 * Image compression utilities for handling file uploads
 */

export interface CompressionResult {
  compressedBlob: Blob;
  compressedSize: number;
  originalSize: number;
  compressionRatio: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates an image file
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB
 * @returns Validation result
 */
export function validateImageFile(file: File, maxSizeMB: number = 10): ValidationResult {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPEG, PNG, WebP, or GIF)'
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }

  return { isValid: true };
}

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Compresses an image to a target file size
 * @param file - The image file to compress
 * @param targetSizeKB - Target file size in KB
 * @param quality - Initial quality (0-1)
 * @returns Promise with compression result
 */
export async function compressImageToTargetSize(
  file: File, 
  targetSizeKB: number, 
  quality: number = 0.8
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      const maxDimension = 1920; // Max width or height
      let { width, height } = img;
      
      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);
      
      // Try different quality levels to reach target size
      const tryCompress = (currentQuality: number): void => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            const blobSizeKB = blob.size / 1024;
            
            // If we're close enough to target size or quality is too low, return result
            if (blobSizeKB <= targetSizeKB || currentQuality <= 0.1) {
              resolve({
                compressedBlob: blob,
                compressedSize: blob.size,
                originalSize: file.size,
                compressionRatio: ((file.size - blob.size) / file.size) * 100
              });
            } else {
              // Try with lower quality
              tryCompress(currentQuality - 0.1);
            }
          },
          'image/jpeg',
          currentQuality
        );
      };
      
      tryCompress(quality);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compresses an image with a specific quality
 * @param file - The image file to compress
 * @param quality - Compression quality (0-1)
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns Promise with compressed blob
 */
export async function compressImage(
  file: File,
  quality: number = 0.8,
  maxWidth: number = 1920,
  maxHeight: number = 1920
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      } else if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Creates a thumbnail from an image file
 * @param file - The image file
 * @param size - Thumbnail size (square)
 * @param quality - Compression quality
 * @returns Promise with thumbnail blob
 */
export async function createThumbnail(
  file: File,
  size: number = 150,
  quality: number = 0.7
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = size;
    canvas.height = size;
    
    img.onload = () => {
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw image centered and cropped to square
      const minDimension = Math.min(img.width, img.height);
      const x = (img.width - minDimension) / 2;
      const y = (img.height - minDimension) / 2;
      
      ctx.drawImage(
        img,
        x, y, minDimension, minDimension,
        0, 0, size, size
      );
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create thumbnail'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}
