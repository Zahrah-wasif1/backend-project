const express = require("express");
const router = express.Router();
const {registerUser,loginUser,  resetPassword, forgotPassword} = require("../Controllers/authControllers");


router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/forgetpassword",forgotPassword);
router.post("/resetpassword",resetPassword);

module.exports = router;


