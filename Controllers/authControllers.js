const User = require("../Models/authModels");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { registerDTO } = require("../Joi/Regsiter.dto");
const { error } = require("console");

exports.registerUser = async (req, res) => {
  try {
    // Validate incoming data
    const { error } = registerDTO.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { email, idNumber } = req.body;

    // Check if email or ID number already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { idNumber }],
    });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Create new user (no password)
    const newUser = new User({
      ...req.body,
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
  }};
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetLink = `http:localhost:8080/api/auth/resetpassword?token=${resetToken}`;

    res.status(200).json({
      message: "Reset link generated",
      resetLink,
      token: resetToken
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password, confirmPassword } = req.body;

    if (!token) return res.status(400).send("Token is missing");
    if (!password || !confirmPassword)
      return res.status(400).send("Both password fields are required");
    if (password !== confirmPassword)
      return res.status(400).send("Passwords do not match");

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).send("Invalid or expired token");

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      message: "User password changed successfully",user,
    });
  } catch (err) {
    res.status(500).send("Server error");
  }
};
exports.getuser = async (req, res) => {
  try {
    const search = req.query.search || "";
    const date = req.query.date || ""; 
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const users = await User.find(filter);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};