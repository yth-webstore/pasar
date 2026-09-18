/**
 * Utility kompresi dan optimasi gambar otomatis untuk marketplace desa.
 * Menjamin file berukuran sangat ringan (target < 150KB) dan menolak berkas video
 * demi menghemat kuota dan memori HP warga desa.
 */

export interface CompressionResult {
  file: File;
  dataUrl: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  reductionPercentage: number;
  width: number;
  height: number;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Reject videos strictly
  if (file.type.startsWith('video/')) {
    return {
      valid: false,
      error: 'Format video tidak diperbolehkan. Produk hanya boleh menggunakan foto/gambar agar aplikasi tetap ringan dan cepat.',
    };
  }

  // Allow only standard image formats
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic', 'image/heif'];
  const fileType = (file?.type || '').toLowerCase();
  if (!validTypes.includes(fileType) && !fileType.startsWith('image/')) {
    return {
      valid: false,
      error: 'Format berkas tidak didukung. Silakan pilih foto dengan format JPG, PNG, atau WebP.',
    };
  }

  return { valid: true };
}

export async function compressAndOptimizeImage(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.78
): Promise<CompressionResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const originalSizeKB = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio preserving downscale
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal menginisialisasi canvas untuk kompresi gambar.'));
          return;
        }

        // Fill white background for transparent PNGs converted to JPEG/WebP
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to image/jpeg
        let format = 'image/webp';
        let dataUrl = canvas.toDataURL(format, quality);

        // Fallback check if browser doesn't support canvas toDataURL webp
        if (!dataUrl.startsWith('data:image/webp')) {
          format = 'image/jpeg';
          dataUrl = canvas.toDataURL(format, quality);
        }

        // Calculate compressed size from base64
        const stringLength = dataUrl.length - 'data:image/webp;base64,'.length;
        const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
        const compressedSizeKB = Math.round(sizeInBytes / 1024);

        // Convert base64 to File object
        const arr = dataUrl ? dataUrl.split(',') : [];
        const mime = arr[0]?.match(/:(.*?);/)?.[1] || 'image/webp';
        const bstr = arr[1] ? atob(arr[1]) : '';
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const compressedFile = new File([u8arr], `pasar-desa-${Date.now()}.${mime === 'image/webp' ? 'webp' : 'jpg'}`, {
          type: mime,
        });

        const reductionPercentage = Math.max(
          0,
          Math.round(((originalSizeKB - compressedSizeKB) / (originalSizeKB || 1)) * 100)
        );

        resolve({
          file: compressedFile,
          dataUrl,
          originalSizeKB,
          compressedSizeKB,
          reductionPercentage,
          width,
          height,
        });
      };

      img.onerror = () => {
        reject(new Error('Gagal memuat gambar untuk proses kompresi.'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca berkas gambar.'));
    };
  });
}
