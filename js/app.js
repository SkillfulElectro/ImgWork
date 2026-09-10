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
                // 1. Compress
                if (options.resize || options.quality < 1) {
                    processedFile = await this.compressor.compress(file, {
                        maxWidth: options.resize ? options.maxWidth : undefined,
                        quality: options.quality
                    });
                }
                // 2. Convert
                if (processedFile.type.split('/')[1] !== options.format) {
                    processedFile = await this.converter.convert(processedFile, options.format);
                } else {
                    processedFile = new File([processedFile], file.name.replace(/\.[^/.]+$/, "") + "." + options.format, { type: processedFile.type });
                }
                this.ui.displayResult(file, processedFile);
            } catch (err) {
                console.error(`Failed to process ${file.name}:`, err);
            }
        }
        this.ui.processBtn.disabled = false;
        this.ui.processBtn.textContent = 'Process Images';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new ImgWorkApp();
});
