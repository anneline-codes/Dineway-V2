import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - The file buffer to upload
 * @param {string} folder - The folder name in Cloudinary
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
const uploadToCloudinary = async (buffer, folder = 'dineway') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @returns {Promise}
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

export { uploadToCloudinary, deleteFromCloudinary };