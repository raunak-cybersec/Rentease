import { v2 as cloudinary } from 'cloudinary';

const getCloudinaryFolder = () => process.env.CLOUDINARY_FOLDER || 'rentease/listings';

const isCloudinaryConfigured = () =>
  Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

const configureCloudinary = () => {
  if (!isCloudinaryConfigured()) return false;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return true;
};

const isDataImage = (value) => typeof value === 'string' && value.startsWith('data:image/');
const isRemoteImage = (value) => typeof value === 'string' && /^https?:\/\//i.test(value);

export const uploadListingImages = async (images = []) => {
  const imageList = Array.isArray(images) ? images.slice(0, 5) : [];
  const needsUpload = imageList.some(isDataImage);

  if (needsUpload && !configureCloudinary()) {
    const error = new Error('Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
    error.status = 500;
    throw error;
  }

  const uploadedImages = await Promise.all(
    imageList.map(async (image) => {
      if (isRemoteImage(image)) return image;
      if (!isDataImage(image)) return null;

      const result = await cloudinary.uploader.upload(image, {
        folder: getCloudinaryFolder(),
        resource_type: 'image',
      });

      return result.secure_url;
    })
  );

  return uploadedImages.filter(Boolean);
};
