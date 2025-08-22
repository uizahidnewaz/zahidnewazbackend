const cloudinary = require("cloudinary").v2;

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload an image to Cloudinary
const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);
    return {
      url: result.secure_url,
      public_id: result.public_id,
      success: true,
    };
  } catch (error) {
    console.error("Error uploading to cloudinary:", error);
    return {
      url: "",
      public_id: "",
      success: false,
      error: error.message,
    };
  }
};

// Delete an image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    if (!publicId) return { success: false, message: "No public ID provided" };

    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === "ok",
      message: result.result,
    };
  } catch (error) {
    console.error("Error deleting from cloudinary:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
};
