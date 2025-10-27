const User = require("../Models/authModels");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { registerDTO } = require("../Joi/Regsiter.dto");

exports.registerUser = async (req, res) => {
  try {
    const { error } = registerDTO.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { email, username, password } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      ...req.body,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

exports.loginUser = async (req,res) =>{
try{
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const token = JWT.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRETKEY,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Login successful ",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
}
   catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error ", error: err.message });
  }}
exports.forgetpassword = async (req,res) =>{
  try{
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(25).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now()+5*60*1000;

    const resetLink = `http://localhost:8080/api/auth/resetpassword/${resetToken}`;

    res.status(200).json({message:"Reset link generated",resetLink,token:resetToken});
  }
  catch(error){
    return res.status(500).json({message:"server error",error});
  }
}