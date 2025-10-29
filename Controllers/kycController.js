// Controllers/kycController.js
const KYC = require("../Models/kycModels");
const axios = require("axios");
const FormData = require("form-data");

exports.verifyIdentity = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, address, idType, idNumber } = req.body;

    const frontImageBuffer = req.files["frontImage"][0].buffer;
    const backImageBuffer = req.files["backImage"][0].buffer;

    const formData = new FormData();
    formData.append("document_primary", frontImageBuffer, "front.jpg");
    formData.append("document_secondary", backImageBuffer, "back.jpg");
    formData.append("document_type", idType);
    formData.append("country", "PK");

    const response = await axios.post(
  "https://api.idanalyzer.com/v2/ocr",
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
    console.error(error);
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};
