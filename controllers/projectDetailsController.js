const ProjectDetails = require("../models/projectDetails");
const Project = require("../models/projects");
const mongoose = require("mongoose");
const { uploadImage, deleteImage } = require("../utils/cloudinary");
const fs = require("fs").promises;

// Create new project details
exports.createProjectDetails = async (req, res) => {
  try {
    console.log("Create project details function called");
    console.log("Request body:", req.body);

    // Validate required fields
    if (!req.body.projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    if (!req.body.headingName) {
      return res.status(400).json({ message: "Heading name is required" });
    }

    // Check if the referenced project exists
    const projectExists = await Project.findById(req.body.projectId);
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Handle main image upload if file is provided
    let mainImageUrl = "";
    let mainImagePublicId = "";

    if (req.cloudinaryResult) {
      mainImageUrl = req.cloudinaryResult.url;
      mainImagePublicId = req.cloudinaryResult.public_id;
      console.log("Image uploaded to Cloudinary:", mainImageUrl);
    } else if (req.file) {
      console.log("File uploaded, path:", req.file.path);
      try {
        const uploadResult = await uploadImage(req.file.path);

        if (uploadResult.success) {
          mainImageUrl = uploadResult.url;
          mainImagePublicId = uploadResult.public_id;
          console.log("Image uploaded to Cloudinary:", mainImageUrl);
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

    // Prepare the project details object
    const projectDetails = new ProjectDetails({
      projectId: req.body.projectId,
      headingName: req.body.headingName,
      mainImage: mainImageUrl,
      mainImagePublicId: mainImagePublicId,
      // Optional fields that can be added if present in the request
      background: req.body.background || {},
      role: req.body.role || {},
      findingProblem: req.body.findingProblem || {},
      oldDesign: req.body.oldDesign || {},
      research: req.body.research || {},
      definingProblem: req.body.definingProblem || {},
      ideation: req.body.ideation || {},
      redisgn: req.body.redisgn || {},
      keytakeways: req.body.keytakeways || {},
    });

    // Save the project details to the database
    await projectDetails.save();
    console.log("Project details saved successfully:", projectDetails);
    res.status(201).json(projectDetails);
  } catch (err) {
    console.error("Error creating project details:", err);
    res.status(500).json({
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// Get all project details
exports.getAllProjectDetails = async (req, res) => {
  try {
    const projectDetails = await ProjectDetails.find();
    res.json(projectDetails);
  } catch (err) {
    console.error("Error getting all project details:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get project details by ID
exports.getProjectDetailsById = async (req, res) => {
  try {
    const projectDetails = await ProjectDetails.findById(req.params.id);
    if (!projectDetails) {
      return res.status(404).json({ message: "Project details not found" });
    }
    res.json(projectDetails);
  } catch (err) {
    console.error("Error getting project details by ID:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get project details by project ID
exports.getProjectDetailsByProjectId = async (req, res) => {
  try {
    const projectDetails = await ProjectDetails.find({
      projectId: req.params.projectId,
    });
    if (!projectDetails || projectDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "No project details found for this project" });
    }
    res.json(projectDetails);
  } catch (err) {
    console.error("Error getting project details by project ID:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update project details
exports.updateProjectDetails = async (req, res) => {
  try {
    // Find the existing project details
    const existingProjectDetails = await ProjectDetails.findById(req.params.id);
    if (!existingProjectDetails) {
      return res.status(404).json({ message: "Project details not found" });
    }

    // Create update data object
    let updateData = {};

    // Update fields if provided
    if (req.body.headingName) updateData.headingName = req.body.headingName;

    // Update nested objects if provided
    if (req.body.background) updateData.background = req.body.background;
    if (req.body.role) updateData.role = req.body.role;
    if (req.body.findingProblem)
      updateData.findingProblem = req.body.findingProblem;
    if (req.body.oldDesign) updateData.oldDesign = req.body.oldDesign;
    if (req.body.research) updateData.research = req.body.research;
    if (req.body.definingProblem)
      updateData.definingProblem = req.body.definingProblem;
    if (req.body.ideation) updateData.ideation = req.body.ideation;
    if (req.body.redisgn) updateData.redisgn = req.body.redisgn;
    if (req.body.keytakeways) updateData.keytakeways = req.body.keytakeways;

    // Handle main image update if file is provided
    if (req.cloudinaryResult) {
      updateData.mainImage = req.cloudinaryResult.url;
      updateData.mainImagePublicId = req.cloudinaryResult.public_id;

      // Delete the old image from cloudinary if it exists
      if (existingProjectDetails.mainImagePublicId) {
        await deleteImage(existingProjectDetails.mainImagePublicId);
      }
    } else if (req.file) {
      try {
        // Upload new image to cloudinary
        const uploadResult = await uploadImage(req.file.path);

        if (uploadResult.success) {
          updateData.mainImage = uploadResult.url;
          updateData.mainImagePublicId = uploadResult.public_id;

          // Delete the old image from cloudinary if it exists
          if (existingProjectDetails.mainImagePublicId) {
            await deleteImage(existingProjectDetails.mainImagePublicId);
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

    // Update the project details
    const updatedProjectDetails = await ProjectDetails.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedProjectDetails);
  } catch (err) {
    console.error("Error updating project details:", err);
    res.status(500).json({
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// Delete project details
exports.deleteProjectDetails = async (req, res) => {
  try {
    // Find the project details first to get the image public ID
    const projectDetails = await ProjectDetails.findById(req.params.id);

    if (!projectDetails) {
      return res.status(404).json({ message: "Project details not found" });
    }

    // Delete the main image from Cloudinary if it exists
    if (projectDetails.mainImagePublicId) {
      const deleteResult = await deleteImage(projectDetails.mainImagePublicId);
      if (!deleteResult.success) {
        console.log(
          `Warning: Failed to delete image from Cloudinary: ${deleteResult.message}`
        );
      }
    }

    // Delete the project details from the database
    await ProjectDetails.findByIdAndDelete(req.params.id);

    res.json({ message: "Project details deleted successfully" });
  } catch (err) {
    console.error("Error deleting project details:", err);
    res.status(500).json({
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};
