export const adjustGooglePhotoSize = (url, size = 128) => {
    if (!url) return null;
    // Replace any existing sXX-c pattern with the desired size
    return url.replace(/s\d+-c/, `s${size}-c`);
};
