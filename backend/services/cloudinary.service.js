const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const saveLocalImage = async (fileBuffer, originalName = 'food.jpg') => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const ext = path.extname(originalName) || '.jpg';
    const filename = `donation-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filePath, fileBuffer);
    return {
      public_id: filename,
      secure_url: `/uploads/${filename}`
    };
  } catch (err) {
    console.error('Local disk image upload error:', err?.message || err);
    return { public_id: null, secure_url: null };
  }
};

const uploadImage = async (fileBuffer, folder = 'foodbridge', originalName = 'food.jpg') => {
  if (!fileBuffer) {
    return { public_id: null, secure_url: null };
  }

  const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'your-api-key';

  if (!isCloudinaryConfigured) {
    return await saveLocalImage(fileBuffer, originalName);
  }

  return new Promise((resolve) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image'
        },
        async (error, result) => {
          if (error) {
            console.error('Cloudinary upload error, falling back to local storage:', error?.message || error);
            const fallbackResult = await saveLocalImage(fileBuffer, originalName);
            return resolve(fallbackResult);
          }
          resolve(result);
        }
      );

      uploadStream.on('error', async (streamErr) => {
        console.error('Cloudinary stream error, falling back to local storage:', streamErr?.message || streamErr);
        const fallbackResult = await saveLocalImage(fileBuffer, originalName);
        resolve(fallbackResult);
      });

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    } catch (err) {
      console.error('Cloudinary exception, falling back to local storage:', err?.message || err);
      saveLocalImage(fileBuffer, originalName).then(resolve);
    }
  });
};

module.exports = {
  uploadImage
};

