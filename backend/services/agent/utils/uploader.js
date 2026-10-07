import cloudinary from "../config/cloudinary.js";

/**
 * Upload an image buffer to Cloudinary
 *
 * @param {string} filename
 * @param {Buffer} buffer
 * @param {string} contentType
 * @returns {Promise<object>}
 */
export const uploadImage = async (
  filename,
  buffer,
  contentType,
) => {
  if (!filename) {
    throw new Error("Filename is required");
  }

  if (!Buffer.isBuffer(buffer)) {
    throw new Error("A valid image buffer is required");
  }

  if (!contentType) {
    throw new Error("Content type is required");
  }

  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          public_id: filename,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result);
        },
      );

    uploadStream.end(buffer);
  });
};