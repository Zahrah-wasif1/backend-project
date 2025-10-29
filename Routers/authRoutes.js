const express = require("express");
const router = express.Router();
const {registerUser,loginUser,  resetPassword, forgotPassword, getuser} = require("../Controllers/authControllers");


router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/forgetpassword",forgotPassword);
router.post("/resetpassword",resetPassword);
router.get("/getusers",getuser);

module.exports = router;


