const Project = require("../models/projects");
const mongoose = require("mongoose");
const { uploadImage, deleteImage } = require("../utils/cloudinary");
const fs = require("fs").promises;

exports.createProject = async (req, res) => {
  try {
    console.log("Create project function called");
    console.log("Request body:", req.body);

    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    let imageUrl = "";
    let imagePublicId = "";

    // Handle image upload if cloudinary result or file is provided
    if (req.cloudinaryResult) {
      imageUrl = req.cloudinaryResult.url;
      imagePublicId = req.cloudinaryResult.public_id;
      console.log("Image uploaded to Cloudinary:", imageUrl);
    } else if (req.file) {
      console.log("File uploaded, path:", req.file.path);
      try {
        const uploadResult = await uploadImage(req.file.path);

        if (uploadResult.success) {
          imageUrl = uploadResult.url;
          imagePublicId = uploadResult.public_id;
          console.log("Image uploaded to Cloudinary:", imageUrl);
        } else {
          console.error("Cloudinary upload failed:", uploadResult.error);
        }

        // Clean up the local file after upload
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting local file:", unlinkError);
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        // Continue with empty image if Cloudinary fails
      }
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message:
          "Database connection is not available. Please try again later.",
      });
    }

    const project = new Project({
      name: req.body.name,
      status: req.body.status || "active",
      priority: req.body.priority || 5,
      image: imageUrl,
      imagePublicId: imagePublicId,
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

exports.updateProject = async (req, res) => {
  try {
    // Find the existing project
    const existingProject = await Project.findById(req.params.id);
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Create update data object
    let updateData = {};

    // Update fields if provided
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.priority !== undefined)
      updateData.priority = Number(req.body.priority);

    // Handle image update if file is provided
    if (req.cloudinaryResult) {
      updateData.image = req.cloudinaryResult.url;
      updateData.imagePublicId = req.cloudinaryResult.public_id;

      // Delete the old image from cloudinary if it exists
      if (existingProject.imagePublicId) {
        await deleteImage(existingProject.imagePublicId);
      }
    } else if (req.file) {
      try {
        // Upload new image to cloudinary
        const uploadResult = await uploadImage(req.file.path);

        if (uploadResult.success) {
          updateData.image = uploadResult.url;
          updateData.imagePublicId = uploadResult.public_id;

          // Delete the old image from cloudinary if it exists
          if (existingProject.imagePublicId) {
            await deleteImage(existingProject.imagePublicId);
          }
        }

        // Clean up the local file after upload
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting local file:", unlinkError);
        }
      } catch (uploadError) {
        console.error("Error processing image:", uploadError);
      }
    }

    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedProject);
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    // Find the project first to get the image public ID
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Delete the image from Cloudinary if it exists
    if (project.imagePublicId) {
      const deleteResult = await deleteImage(project.imagePublicId);
      if (!deleteResult.success) {
        console.log(
          `Warning: Failed to delete image from Cloudinary: ${deleteResult.message}`
        );
      }
    }

    // Delete the project from the database
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};
