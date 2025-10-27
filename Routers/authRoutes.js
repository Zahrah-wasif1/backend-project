const express = require("express");
const router = express.Router();
const {registerUser,loginUser,forgetpassword} = require("../Controllers/authControllers");


router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/forgetpassword",forgetpassword);

module.exports = router;


