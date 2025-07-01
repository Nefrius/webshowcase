import { supabase } from './supabase';

// Upload progress callback type
export type UploadProgressCallback = (progress: number) => void;

// Image compression function
const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Upload image to Supabase Storage
export const uploadWebsiteImage = async (
  file: File,
  websiteId: string,
  onProgress?: UploadProgressCallback
): Promise<string> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Sadece resim dosyaları yüklenebilir');
    }

    // Validate file size (max 50MB for Supabase)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('Dosya boyutu 50MB\'dan küçük olmalıdır');
    }

    // Compress image
    const compressedFile = await compressImage(file);
    
    // Create unique filename
    const fileExt = compressedFile.name.split('.').pop();
    const fileName = `${websiteId}_${Date.now()}.${fileExt}`;
    const filePath = `website-images/${fileName}`;

    // Simulate progress for UI
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 15;
      if (onProgress && progress <= 90) {
        onProgress(progress);
      }
    }, 150);

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('website-images')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });

    // Clear progress interval
    clearInterval(progressInterval);
    if (onProgress) {
      onProgress(100);
    }

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error('Resim yüklenirken hata oluştu: ' + error.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('website-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;

  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error instanceof Error ? error.message : 'Resim yüklenirken hata oluştu');
  }
};

// Delete image from Supabase Storage
export const deleteWebsiteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/'); // Get 'website-images/filename'
    
    if (filePath.startsWith('website-images/')) {
      const { error } = await supabase.storage
        .from('website-images')
        .remove([filePath]);
      
      if (error) {
        console.error('Delete error:', error);
      }
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error for image deletion to avoid breaking other operations
  }
};

// Validate image file
export const validateImageFile = (file: File): string | null => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return 'Sadece resim dosyaları yüklenebilir';
  }
  
  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return 'Dosya boyutu 50MB\'dan küçük olmalıdır';
  }
  
  return null; // No error
};

// Create storage bucket if it doesn't exist
export const createStorageBucket = async () => {
  try {
    const { data, error } = await supabase.storage.createBucket('website-images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      fileSizeLimit: 50 * 1024 * 1024 // 50MB
    });

    if (error) {
      console.log('Bucket already exists or error creating:', error.message);
    } else {
      console.log('Storage bucket created successfully:', data);
    }
  } catch (error) {
    console.error('Error creating storage bucket:', error);
  }
}; 