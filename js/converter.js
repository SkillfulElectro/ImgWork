class ImageConverter {
    constructor() {
        if (typeof UPNG === 'undefined') {
            throw new Error('UPNG.js library not loaded');
        }
    }

    async convert(file, targetFormat, quality = 0.8, maxWidth = null) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    
                    // Handle resizing if not already done by compressor
                    if (maxWidth && width > maxWidth) {
                        const ratio = maxWidth / width;
                        width = maxWidth;
                        height = Math.round(height * ratio);
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    if (targetFormat === 'png') {
                        // Use UPNG.js for high-quality PNG
                        const imageData = ctx.getImageData(0, 0, width, height);
                        const pngBuffer = UPNG.encode([imageData.data.buffer], width, height);
                        const blob = new Blob([pngBuffer], { type: 'image/png' });
                        resolve(this._createFile(blob, file.name, 'png'));
                    } else {
                        let mimeType = `image/${targetFormat}`;
                        
                        // Try native conversion (JPEG, WebP, AVIF, BMP)
                        canvas.toBlob((blob) => {
                            if (blob) {
                                resolve(this._createFile(blob, file.name, targetFormat));
                            } else {
                                // Fallback: If AVIF isn't supported by this browser, fallback to WebP then JPEG
                                console.warn(`Format ${targetFormat} not natively supported, falling back...`);
                                canvas.toBlob((fallbackBlob) => {
                                    resolve(this._createFile(fallbackBlob, file.name, 'webp'));
                                }, 'image/webp', quality);
                            }
                        }, mimeType, quality);
                    }
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    _createFile(blob, originalName, extension) {
        const baseName = originalName.replace(/\.[^/.]+$/, "");
        return new File([blob], `${baseName}.${extension}`, { type: blob.type });
    }
}
