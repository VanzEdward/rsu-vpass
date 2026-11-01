/**
 * Client-Side Image Compression Utility
 * Resizes and compresses image Files or Data URLs using HTML5 Canvas.
 * Keeps uploaded documents, selfies, and receipts under ~150KB-250KB while preserving visual clarity.
 * Prevents mobile device crashes and LocalStorage quota exhaustion (5MB Safari limit).
 */

/**
 * Checks whether a value is a valid renderable image URL or Base64 data URI.
 * Rejects placeholder strings like "[IN_CLOUD_STORAGE]", "Uploaded Document", or non-image text.
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed === '[IN_CLOUD_STORAGE]' ||
    trimmed.includes('[IN_CLOUD_STORAGE]') ||
    trimmed === 'Uploaded Document' ||
    trimmed.startsWith('[')
  ) {
    return false;
  }
  return (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('blob:')
  );
};

export const compressImage = (fileOrDataUrl, maxWidth = 1200, maxHeight = 1200, quality = 0.75) => {
  return new Promise((resolve) => {
    if (!fileOrDataUrl) {
      return resolve(null);
    }

    const processDataUrl = (srcDataUrl) => {
      if (!srcDataUrl || typeof srcDataUrl !== 'string') {
        return resolve(srcDataUrl);
      }

      // If it's not an image DataURL (e.g. placeholder string or URL), return as-is
      if (!srcDataUrl.startsWith('data:image/')) {
        return resolve(srcDataUrl);
      }

      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // Only scale down if image exceeds maximum dimensions
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(srcDataUrl);
          }

          // Draw with high quality interpolation
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export compressed JPEG
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (err) {
          console.warn('[ImageCompressor] Canvas compression failed, using original:', err);
          resolve(srcDataUrl);
        }
      };

      img.onerror = () => {
        resolve(srcDataUrl);
      };

      img.src = srcDataUrl;
    };

    if (typeof fileOrDataUrl === 'string') {
      processDataUrl(fileOrDataUrl);
    } else if (fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        processDataUrl(e.target?.result);
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsDataURL(fileOrDataUrl);
    } else {
      resolve(null);
    }
  });
};
