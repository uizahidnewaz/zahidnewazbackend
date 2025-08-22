const express = require("express");
const router = express.Router();
const multer = require("multer");
// Configure multer to store files in memory instead of disk
const upload = multer({ storage: multer.memoryStorage() });
const { cloudinaryUpload } = require("../middleware/cloudinaryMiddleware");
const projectController = require("../controllers/projectController");

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

// Add try/catch to avoid crashes
router.post(
  "/projects",
  upload.single("image"),
  cloudinaryUpload,
  async (req, res, next) => {
    try {
      console.log("Processing POST /projects request");
      await projectController.createProject(req, res);
    } catch (error) {
      console.error("Error in POST /projects:", error);
      next(error);
    }
  }
);

router.get("/projects", projectController.getProjects);
router.get("/projects/:id", projectController.getProjectById);

router.put(
  "/projects/:id",
  upload.single("image"),
  cloudinaryUpload,
  projectController.updateProject
);

router.delete("/projects/:id", projectController.deleteProject);

module.exports = router;
