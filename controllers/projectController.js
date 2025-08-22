const Project = require("../models/projects");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createProject = async (req, res) => {
  try {
    console.log("Create project function called");
    console.log("Request body:", req.body);

    if (!req.body.iid) {
      return res.status(400).json({ message: "Project ID (iid) is required" });
    }

    let image = "";
    if (req.file) {
      console.log("File uploaded, path:", req.file.path);
      try {
        const result = await cloudinary.uploader.upload(req.file.path);
        image = result.secure_url;
        console.log("Image uploaded to Cloudinary:", image);
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        // Continue with empty image if Cloudinary fails
      }
    }

    // Check if a project with the same iid already exists
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          message:
            "Database connection is not available. Please try again later.",
        });
      }

      const existingProject = await Project.findOne({
        iid: req.body.iid,
      }).maxTimeMS(5000);

      if (existingProject) {
        return res
          .status(400)
          .json({ message: "A project with this ID already exists" });
      }
    } catch (dbError) {
      console.error("Database query error:", dbError);
      return res.status(500).json({
        message: "Database error when checking for existing project",
        error: dbError.message,
      });
    }

    const project = new Project({
      iid: req.body.iid,
      image,
    });

    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          message:
            "Database connection is not available. Please try again later.",
        });
      }

      await project.save();
      console.log("Project saved successfully:", project);
      res.status(201).json(project);
    } catch (saveError) {
      console.error("Error saving project:", saveError);

      if (
        saveError.name === "MongooseServerSelectionError" ||
        saveError.message.includes("buffering timed out")
      ) {
        return res.status(503).json({
          message: "Database connection timed out. Please try again later.",
          error: saveError.message,
        });
      }

      res.status(500).json({
        error: saveError.message,
        stack:
          process.env.NODE_ENV === "development" ? saveError.stack : undefined,
      });
    }
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProjectByIid = async (req, res) => {
  try {
    const project = await Project.findOne({ iid: req.params.iid });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    let updateData = {};

    // Only update iid if provided
    if (req.body.iid) {
      // Check if another project with the same iid already exists (excluding the current one)
      const existingProject = await Project.findOne({
        iid: req.body.iid,
        _id: { $ne: req.params.id },
      });

      if (existingProject) {
        return res
          .status(400)
          .json({ message: "A project with this ID already exists" });
      }

      updateData.iid = req.body.iid;
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateData.image = result.secure_url;
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
