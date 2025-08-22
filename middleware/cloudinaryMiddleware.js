const { cloudinary } = require("../utils/cloudinary");
const streamifier = require("streamifier");

// Middleware to handle file upload to Cloudinary
const cloudinaryUpload = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // Create a stream from the buffer
  const stream = streamifier.createReadStream(req.file.buffer);

  // Create a Cloudinary upload stream
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: "project-details",
    },
    (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);
        return next(error);
      }

      // Add Cloudinary upload result to the request
      req.cloudinaryResult = {
        url: result.secure_url,
        public_id: result.public_id,
        success: true,
      };

      next();
    }
  );

  // Pipe the file buffer to the upload stream
  stream.pipe(uploadStream);
};

module.exports = {
  cloudinaryUpload,
};
