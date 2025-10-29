// Controllers/kycController.js
const KYC = require("../Models/kycModels");
const axios = require("axios");
const FormData = require("form-data");

exports.verifyIdentity = async (req, res) => {
  try {
    if (!process.env.IDANALYZER_SERVER_KEY) {
      return res.status(500).json({
        message: "Server misconfigured: missing IDANALYZER_SERVER_KEY",
      });
    }

    const { fullName, email, phoneNumber, address, idType, idNumber } = req.body;

    if (!req.files || !req.files["frontImage"] || !req.files["backImage"]) {
      return res.status(400).json({
        message: "frontImage and backImage files are required",
      });
    }

    const frontImageBuffer = req.files["frontImage"][0].buffer;
    const backImageBuffer = req.files["backImage"][0].buffer;

    const formData = new FormData();
    formData.append("document_primary", frontImageBuffer, "front.jpg");
    formData.append("document_secondary", backImageBuffer, "back.jpg");
    formData.append("document_type", idType);
    formData.append("country", "PK");

    const ocrUrl = process.env.IDANALYZER_OCR_URL || "https://api.idanalyzer.com/v2/ocr";
    const response = await axios.post(
      ocrUrl,
      formData,
      { headers: { ...formData.getHeaders(), "X-API-KEY": process.env.IDANALYZER_SERVER_KEY } }
    );

    const kycRecord = await KYC.create({
      fullName,
      email,
      phone: phoneNumber,
      address,
      idType,
      idNumber,
      frontImage: frontImageBuffer,
      backImage: backImageBuffer,
      verificationStatus: response.data.error ? "failed" : "success",
      verificationResult: response.data
    });

    res.status(200).json({ message: "KYC verification completed", data: kycRecord });

  } catch (error) {
    if (error.response) {
      console.error("ID Analyzer error:", {
        status: error.response.status,
        data: error.response.data,
      });
      return res.status(502).json({
        message: "Verification failed (upstream)",
        requestedUrl: (error.config && error.config.url) || null,
        upstreamStatus: error.response.status,
        upstreamError: error.response.data,
      });
    }
    console.error(error);
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};
