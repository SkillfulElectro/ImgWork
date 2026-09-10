class ImageConverter {
    constructor() {
        if (typeof UPNG === 'undefined') {
            throw new Error('UPNG.js library not loaded');
        }
    }

    async convert(file, targetFormat) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    if (targetFormat === 'png') {
                        // Use UPNG.js for advanced PNG encoding
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const pngBuffer = UPNG.encode([imageData.data.buffer], canvas.width, canvas.height);
                        const blob = new Blob([pngBuffer], { type: 'image/png' });
                        resolve(new File([blob], file.name, { type: 'image/png' }));
                    } else {
                        // Native Canvas API for JPEG, WebP, BMP
                        canvas.toBlob((blob) => {
                            if (blob) {
                                resolve(new File([blob], file.name, { type: blob.type }));
                            } else {
                                reject(new Error('Conversion failed'));
                            }
                        }, `image/${targetFormat}`, 0.92);
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
}
