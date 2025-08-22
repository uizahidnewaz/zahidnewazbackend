const express = require("express");
const router = express.Router();
const multer = require("multer");
// Configure multer to store files in memory instead of disk
const upload = multer({ storage: multer.memoryStorage() });
const { cloudinaryUpload } = require("../middleware/cloudinaryMiddleware");
const projectDetailsController = require("../controllers/projectDetailsController");

// Debug middleware
router.use((req, res, next) => {
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  if (req.file) {
    console.log("File uploaded:", req.file);
  }
  if (req.body) {
    console.log("Request body:", req.body);
  }
  next();
});

// CREATE - Add a new project details
router.post(
  "/project-details",
  upload.single("mainImage"),
  cloudinaryUpload,
  async (req, res, next) => {
    try {
      console.log("Processing POST /project-details request");
      await projectDetailsController.createProjectDetails(req, res);
    } catch (error) {
      console.error("Error in POST /project-details:", error);
      next(error);
    }
  }
);

// READ - Get all project details
router.get("/project-details", projectDetailsController.getAllProjectDetails);

// READ - Get project details by ID
router.get(
  "/project-details/:id",
  projectDetailsController.getProjectDetailsById
);

// READ - Get project details by project ID
router.get(
  "/projects/:projectId/details",
  projectDetailsController.getProjectDetailsByProjectId
);

// UPDATE - Update project details by ID
router.put(
  "/project-details/:id",
  upload.single("mainImage"),
  cloudinaryUpload,
  async (req, res, next) => {
    try {
      console.log(`Processing PUT /project-details/${req.params.id} request`);
      await projectDetailsController.updateProjectDetails(req, res);
    } catch (error) {
      console.error(`Error in PUT /project-details/${req.params.id}:`, error);
      next(error);
    }
  }
);

// DELETE - Delete project details by ID
router.delete("/project-details/:id", async (req, res, next) => {
  try {
    console.log(`Processing DELETE /project-details/${req.params.id} request`);
    await projectDetailsController.deleteProjectDetails(req, res);
  } catch (error) {
    console.error(`Error in DELETE /project-details/${req.params.id}:`, error);
    next(error);
  }
});

module.exports = router;
