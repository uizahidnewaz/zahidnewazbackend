const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    iid: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Add timestamps to automatically track createdAt and updatedAt
    timestamps: true,
    // Transform the object when converted to JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add a pre-save hook to log saving operations
projectSchema.pre("save", function (next) {
  console.log("Saving project with ID:", this.iid);
  next();
});

// Add index to improve query performance
projectSchema.index({ iid: 1 });

module.exports = mongoose.model("project", projectSchema);
