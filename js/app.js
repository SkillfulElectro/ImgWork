class ImgWorkApp {
    constructor() {
        this.ui = new UIController();
        this.compressor = new ImageCompressor();
        this.converter = new ImageConverter();
        
        document.addEventListener('processImages', async (e) => {
            await this.processAll(e.detail.files, e.detail.options);
        });
    }

    async processAll(files, options) {
        this.ui.processBtn.disabled = true;
        this.ui.processBtn.textContent = 'Processing...';

        for (const file of files) {
            try {
                let processedFile = file;
                
                // Determine if we should use the Web Worker compressor
                const isCompressorSupported = ['jpeg', 'png', 'webp', 'bmp'].includes(options.format);
                const needsCompression = options.resize || options.quality < 1;
                
                // 1. Compress via Web Worker (if format is supported by browser-image-compression)
                if (needsCompression && isCompressorSupported) {
                    processedFile = await this.compressor.compress(file, {
                        maxWidth: options.resize ? options.maxWidth : undefined,
                        quality: options.quality
                    });
                }

                // 2. Convert format
                const currentExt = processedFile.name.split('.').pop().toLowerCase();
                if (currentExt !== options.format) {
                    processedFile = await this.converter.convert(
                        processedFile, 
                        options.format, 
                        options.quality, 
                        // Pass resize params only if compressor didn't handle them (e.g., AVIF)
                        (needsCompression && !isCompressorSupported) ? options.maxWidth : null
                    );
                } else {
                    const baseName = processedFile.name.replace(/\.[^/.]+$/, "");
                    processedFile = new File([processedFile], `${baseName}.${options.format}`, { type: processedFile.type });
                }
                
                this.ui.displayResult(file, processedFile);
            } catch (err) {
                console.error(`Failed to process ${file.name}:`, err);
                this.ui.displayError(file, err); // Show error in UI
            }
        }
        this.ui.processBtn.disabled = false;
        this.ui.processBtn.textContent = 'Process Images';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new ImgWorkApp();
});
