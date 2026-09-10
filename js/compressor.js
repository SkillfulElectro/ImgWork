class ImageCompressor {
    constructor() {
        // Removed the throw error to prevent app crash on load
    }

    async compress(file, options) {
        // Check if library is available at runtime
        if (typeof browserImageCompression === 'undefined') {
            console.warn('browser-image-compression library not loaded. Skipping compression.');
            return file; // Return original file if library missing
        }

        const compressionOptions = {
            maxSizeMB: 10, 
            maxWidthOrHeight: options.maxWidth || undefined,
            useWebWorker: true, 
            initialQuality: options.quality || 0.8
        };

        try {
            return await browserImageCompression(file, compressionOptions);
        } catch (error) {
            console.error('Compression error:', error);
            throw error;
        }
    }
}
