const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fullName: String,
  documentName: String,
  documentNumber: String,
  expiryDate: String,
  nationality: String,
  verificationStatus: String,
}, { timestamps: true });

module.exports = mongoose.model("KYC", kycSchema);
