class ImageCompressor {
    constructor() {
        if (typeof browserImageCompression === 'undefined') {
            throw new Error('browser-image-compression library not loaded');
        }
    }

    async compress(file, options) {
        const compressionOptions = {
            maxSizeMB: 10, // Fallback limit
            maxWidthOrHeight: options.maxWidth || undefined,
            useWebWorker: true, // Keeps UI responsive
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
