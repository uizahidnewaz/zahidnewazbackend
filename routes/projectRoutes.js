const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const projectController = require("../controllers/projectController");

// Debug middleware
router.use((req, res, next) => {
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Add try/catch to avoid crashes
router.post("/projects", upload.single("image"), (req, res, next) => {
  try {
    console.log("Processing POST /projects request");
    projectController.createProject(req, res);
  } catch (error) {
    console.error("Error in POST /projects:", error);
    next(error);
  }
});

router.get("/projects", projectController.getProjects);
router.get("/projects/:id", projectController.getProjectById);
router.get("/projects/iid/:iid", projectController.getProjectByIid);

router.put(
  "/projects/:id",
  upload.single("image"),
  projectController.updateProject
);

router.delete("/projects/:id", projectController.deleteProject);

module.exports = router;
