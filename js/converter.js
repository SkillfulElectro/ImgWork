class ImageConverter {
    constructor() {
        // Removed the throw error to prevent app crash on load
    }

    async convert(file, targetFormat, quality = 0.8, maxWidth = null) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    
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
                        // Use UPNG.js if available, otherwise fallback to native canvas
                        if (typeof UPNG !== 'undefined') {
                            try {
                                const imageData = ctx.getImageData(0, 0, width, height);
                                const pngBuffer = UPNG.encode([imageData.data.buffer], width, height);
                                const blob = new Blob([pngBuffer], { type: 'image/png' });
                                resolve(this._createFile(blob, file.name, 'png'));
                                return;
                            } catch (e) {
                                console.warn('UPNG failed, falling back to canvas', e);
                            }
                        }
                        
                        // Fallback for PNG
                        canvas.toBlob((blob) => {
                            resolve(this._createFile(blob, file.name, 'png'));
                        }, 'image/png');
                    } else {
                        let mimeType = `image/${targetFormat}`;
                        
                        canvas.toBlob((blob) => {
                            if (blob) {
                                resolve(this._createFile(blob, file.name, targetFormat));
                            } else {
                                // Fallback: If AVIF isn't supported by this browser, fallback to WebP
                                console.warn(`Format ${targetFormat} not natively supported, falling back to WebP...`);
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
