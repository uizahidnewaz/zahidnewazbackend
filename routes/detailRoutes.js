const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const detailController = require("../controllers/detailController");

router.post("/details", upload.single("photo"), detailController.createDetail);
router.get("/details", detailController.getDetails);

module.exports = router;
