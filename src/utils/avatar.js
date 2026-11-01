export async function prepareAvatar(file) {
    if (!file.size || file.size > 10 * 1024 * 1024) {
        throw new Error('Choose a non-empty photo up to 10 MB.');
    }
    if (!/\.(png|jpe?g|webp|gif)$/i.test(file.name)) {
        throw new Error('Use PNG, JPEG, WebP, or GIF. Convert HEIC/HEIF photos to JPEG first.');
    }
    const url = URL.createObjectURL(file);
    try {
        const image = new Image();
        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = () => reject(new Error('This image could not be opened. Try another photo or export it as JPEG.'));
            image.src = url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        if (!context || !image.naturalWidth || !image.naturalHeight) {
            throw new Error('Your browser could not prepare this photo. Please try another browser.');
        }
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, 512, 512);
        return canvas.toDataURL('image/webp', 0.85);
    } finally {
        URL.revokeObjectURL(url);
    }
}
