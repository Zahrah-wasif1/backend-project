const KYC = require("../Models/kycModels");
const axios = require("axios");

exports.verifyIdentity = async (req, res) => {
  try {
    const apiKey = process.env.IDANALYZER_API_KEY;
    const profileId = process.env.IDANALYZER_PROFILE_ID;
    const apiUrl = process.env.IDANALYZER_API_URL || "https://api2.idanalyzer.com/ocr";

    if (!apiKey || !profileId) {
      return res.status(500).json({ message: "Missing IDANALYZER_API_KEY or IDANALYZER_PROFILE_ID" });
    }

    const { fullName, email, phoneNumber, address, idType, idNumber } = req.body;
    if (!fullName || !email || !phoneNumber || !address || !idType || !idNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.files || !req.files["frontImage"] || !req.files["backImage"]) {
      return res.status(400).json({ message: "frontImage and backImage are required" });
    }

    // Convert images to base64
    const frontBase64 = req.files["frontImage"][0].buffer.toString("base64");
    const backBase64 = req.files["backImage"][0].buffer.toString("base64");

    const payload = {
      document: `data:image/jpeg;base64,${frontBase64}`,
      document_back: `data:image/jpeg;base64,${backBase64}`,
      profile: profileId,
      country: "PK",
      id_type: idType,
      id_number: idNumber,
      user_email: email,
      user_phone: phoneNumber,
      user_fullname: fullName,
      user_address: address,
    };

    // Send to ID Analyzer
    const response = await axios.post(apiUrl, payload, {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 120000,
    });

    // Extract simple data from API response
    const data = response.data?.data || {};
    const simplified = {
      documentName: data.documentName?.[0]?.value || null,
      documentNumber: data.documentNumber?.[0]?.value || null,
      nationality: data.nationalityFull?.[0]?.value || null,
      country: data.countryFull?.[0]?.value || null,
      personalNumber: data.personalNumber?.[0]?.value || null,
      internalId: data.internalId?.[0]?.value || null,
      verificationStatus: response.data.error ? "failed" : "success",
    };

    // Save full record in DB (images included)
    const kycRecord = await KYC.create({
      fullName,
      email,
      phone: phoneNumber,
      address,
      idType,
      idNumber,
      frontImage: req.files["frontImage"][0].buffer,
      backImage: req.files["backImage"][0].buffer,
      verificationStatus: simplified.verificationStatus,
      verificationResult: response.data,
    });

    // Hide images & full JSON from response
    const sanitizedRecord = kycRecord.toObject();
    delete sanitizedRecord.frontImage;
    delete sanitizedRecord.backImage;
    delete sanitizedRecord.verificationResult;

    // ✅ Final Clean Response
    res.status(200).json({
      message: "KYC verification completed successfully",
      data: {
        ...sanitizedRecord,
        verificationSummary: simplified,
      },
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
