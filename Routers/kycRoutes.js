const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const { verifyIdentity } = require("../Controllers/kycController");

router.post("/verifyidentity", upload.single("documentImage"), verifyIdentity);

module.exports = router;
