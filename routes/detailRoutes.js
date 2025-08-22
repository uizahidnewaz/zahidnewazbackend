const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const detailController = require("../controllers/detailController");

// Debug middleware
router.use((req, res, next) => {
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Add try/catch to avoid crashes
router.post("/details", upload.single("photo"), (req, res, next) => {
  try {
    console.log("Processing POST /details request");
    detailController.createDetail(req, res);
  } catch (error) {
    console.error("Error in POST /details:", error);
    next(error);
  }
});
router.get("/details", detailController.getDetails);
router.get("/details/:id", detailController.getDetailById);
router.put(
  "/details/:id",
  upload.single("photo"),
  detailController.updateDetail
);
router.delete("/details/:id", detailController.deleteDetail);

module.exports = router;
