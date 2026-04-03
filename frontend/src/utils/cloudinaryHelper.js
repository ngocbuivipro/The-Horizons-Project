export const getOptimizedVideoUrl = (publicId) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    if (!cloudName || !publicId) {
        console.warn("Cloudinary config is missing. Please check your .env file.");
        return "";
    }
    const transformations = "f_auto,q_auto,w_1280,vc_auto";

    return `https://res.cloudinary.com/${cloudName}/video/upload/${transformations}/${publicId}.mp4`;
};
