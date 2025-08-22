const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    priority: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    image: {
      type: String,
      default: "",
    },
    imagePublicId: {
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
  console.log("Saving project with name:", this.name);
  next();
});

// Add index to improve query performance
projectSchema.index({ name: 1 });

module.exports = mongoose.model("project", projectSchema);
