const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
  fullName: 
  { type: String,
     required: true },
  email: { 
    type: String, 
    required: true 
  },
  phone: {
     type: Number,
      required: true },
  address: { 
    type: String,
     required: true },
  idType: { 
    type: String,
     required: true },
  idNumber: { 
    type: String, 
    required: true 
  },
  frontImage: { 
    type: Buffer 
  },
  backImage: { 
    type: Buffer 
  },
  verificationResult: Object,
  verificationStatus: {
     type: String,
      enum: [
        "pending", 
        "success",
        "failed"],
      default: "pending"
     },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("KycRecord", kycSchema);
