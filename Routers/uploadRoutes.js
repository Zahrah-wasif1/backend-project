const express = require("express");
const multer = require("multer");
const { storage } = require("../config/cloudnairy");

const router = express.Router();
const upload = multer({ storage });

router.post(
  "/images",
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.files.frontImage || !req.files.backImage) {
        return res.status(400).json({ message: "Both images are required!" });
      }

      const frontImageUrl = req.files.frontImage[0].path;
      const backImageUrl = req.files.backImage[0].path;

      res.status(200).json({
        message: "Images uploaded successfully to Cloudinary!",
        frontImageUrl,
        backImageUrl,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Upload failed", error: error.message });
    }
  }
);

module.exports = router;
