const Detail = require("../models/Detail");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createDetail = async (req, res) => {
  try {
    let photoUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      photoUrl = result.secure_url;
    }
    const detail = new Detail({
      name: req.body.name,
      description: req.body.description,
      photoUrl,
    });
    await detail.save();
    res.status(201).json(detail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDetails = async (req, res) => {
  try {
    const details = await Detail.find();
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
