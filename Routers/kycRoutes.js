// Routes/kycRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const { verifyIdentity } = require("../Controllers/kycController");

router.post(
  "/verifyidentity",
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 }
  ]),
  verifyIdentity
);

module.exports = router;
