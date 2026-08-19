const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const ApiError = require('../utils/ApiError');

const uploadImage = async (fileBuffer, folder = 'foodbridge') => {
  const DEFAULT_IMAGE = {
    public_id: `default_${Date.now()}`,
    secure_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop'
  };

  if (!fileBuffer) {
    return DEFAULT_IMAGE;
  }

  const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name' &&
    process.env.CLOUDINARY_API_KEY !== 'your-api-key';

  if (!isCloudinaryConfigured) {
    return DEFAULT_IMAGE;
  }

  return new Promise((resolve) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error?.message || error);
            return resolve(DEFAULT_IMAGE);
          }
          resolve(result);
        }
      );

      uploadStream.on('error', (streamErr) => {
        console.error('Cloudinary stream error:', streamErr?.message || streamErr);
        resolve(DEFAULT_IMAGE);
      });

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    } catch (err) {
      console.error('Cloudinary exception:', err?.message || err);
      resolve(DEFAULT_IMAGE);
    }
  });
};

module.exports = {
  uploadImage
};
