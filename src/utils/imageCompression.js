/**
 * Image Compression Utility
 * Compresses images to optimal size for web storage
 */

const TARGET_QUALITY = 0.75; // 75% quality for normal files

/**
 * Compress a single image file
 * @param {File} file - Image file to compress
 * @param {number} quality - Quality level (0-1)
 * @returns {Promise<{file: File, originalSize: number, compressedSize: number, compression: number}>}
 */
export const compressImage = async (file, quality = TARGET_QUALITY) => {
    return new Promise((resolve, reject) => {
        // Check file type
        if (!file.type.startsWith('image/')) {
            reject(new Error('File must be an image'));
            return;
        }

        const originalSize = file.size;

        // If file is small enough, return as is
        if (originalSize < 100 * 1024) { // Less than 100 KB
            resolve({
                file,
                originalSize,
                compressedSize: originalSize,
                compression: 0
            });
            return;
        }

        const reader = new FileReader();
        
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas dimensions
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw image
                ctx.drawImage(img, 0, 0);
                
                // Convert to blob with target quality
                canvas.toBlob((blob) => {
                    const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
                    const compression = Math.round((1 - blob.size / originalSize) * 100);
                    
                    resolve({
                        file: compressedFile,
                        originalSize,
                        compressedSize: blob.size,
                        compression
                    });
                }, 'image/jpeg', quality);
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            
            img.src = event.target.result;
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
    });
};

/**
 * Format bytes to human readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes, k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @returns {object} {valid: boolean, error?: string}
 */
export const validateFileSize = (file) => {
    if (!file.type.startsWith('image/')) {
        return {
            valid: false,
            error: 'File must be an image'
        };
    }
    return { valid: true };
};
