const express = require("express");
const router = express.Router();
const { verifyImage, getKYCUser } = require("../Controllers/kycController");
const multer = require("multer");

const upload = multer();

router.post("/verify/image", upload.fields([
  { name: "frontImage", maxCount: 1 },
  { name: "backImage", maxCount: 1 }
]), verifyImage);

//router.get("/users", getKYCUser);

module.exports = router;
