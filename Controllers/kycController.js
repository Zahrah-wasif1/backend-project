const axios = require("axios");
const KYC = require("../Models/kycModels");

exports.verifyImage = async (req, res) => {
  try {
    const apiKey = process.env.IDANALYZER_API_KEY;
    const profileId = process.env.IDANALYZER_PROFILE_ID;
    const apiUrl = process.env.IDANALYZER_API_URL || "https://api2.idanalyzer.com/ocr";

    if (!apiKey || !profileId) {
      return res.status(500).json({ message: "Missing IDANALYZER_API_KEY or IDANALYZER_PROFILE_ID" });
    }

    // Check for uploaded images
    let frontBase64 = req.files?.frontImage?.[0]?.buffer
      ? req.files.frontImage[0].buffer.toString("base64")
      : null;
    let backBase64 = req.files?.backImage?.[0]?.buffer
      ? req.files.backImage[0].buffer.toString("base64")
      : null;

    if (!frontBase64) {
      return res.status(400).json({ message: "Front image is required for verification" });
    }

    // Prepare payload for ID Analyzer
    const payload = {
      profile: profileId,
      country: "PK",
      document: `data:image/jpeg;base64,${frontBase64}`,
    };

    if (backBase64)
      payload.document_back = `data:image/jpeg;base64,${backBase64}`;

    // Send to ID Analyzer API
    const response = await axios.post(apiUrl, payload, {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 120000,
    });

    const data = response.data?.data || {};

    // Simplified extracted data
    const simplified = {
      fullName: data.fullName?.[0]?.value || null,
      documentName: data.documentName?.[0]?.value || null,
      documentNumber: data.documentNumber?.[0]?.value || null,
      expiryDate: data.expiryDate?.[0]?.value || null,
      nationality: data.nationalityFull?.[0]?.value || null,
      verificationStatus: response.data.error ? "failed" : "success",
      userId: req.user?._id || req.body.userId || null, // optional
    };

    // ✅ Save to MongoDB
    const savedKYC = await KYC.create(simplified);

    res.status(200).json({
      message: "Image verification completed and saved successfully",
      data: savedKYC,
    });

  } catch (error) {
    console.error(error);
    if (error.response) {
      return res.status(502).json({
        message: "Verification failed (upstream)",
        status: error.response.status,
        error: error.response.data?.error || "Unknown error from upstream",
      });
    }
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};
