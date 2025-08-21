const mongoose = require("mongoose");

const detailSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  photoUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Detail", detailSchema);
