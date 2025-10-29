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

    const headers = { ...formData.getHeaders(), "X-API-KEY": process.env.IDANALYZER_SERVER_KEY };

    const normalizeOcrUrl = (rawUrl) => {
      if (!rawUrl) return "https://api.idanalyzer.com/v2/ocr";
      try {
        const u = new URL(rawUrl);
        // If no pathname or just '/'
        if (!u.pathname || u.pathname === "/") {
          u.pathname = "/ocr"; // default path
        }
        // Remove double slashes at end
        if (u.pathname.endsWith("//")) {
          u.pathname = u.pathname.replace(/\/+$/, "/");
        }
        // Ensure it ends with '/ocr' or '/v2/ocr'
        if (!/\/ocr$/.test(u.pathname)) {
          // If user specified '/v2', append '/ocr'
          if (/\/v2$/.test(u.pathname)) {
            u.pathname = `${u.pathname}/ocr`;
          }
        }
        return u.toString();
      } catch (_) {
        return rawUrl;
      }
    };

    let ocrUrl = normalizeOcrUrl(process.env.IDANALYZER_OCR_URL) || "https://api.idanalyzer.com/v2/ocr";
    let response;
    const upstreamTimeoutMs = Number(process.env.IDANALYZER_TIMEOUT_MS || 120000);
    const tryPost = async (urlToUse) => axios.post(urlToUse, formData, { headers, timeout: upstreamTimeoutMs });

    try {
      response = await tryPost(ocrUrl);
    } catch (primaryErr) {
      const is404 = primaryErr.response && primaryErr.response.status === 404;
      if (!is404) throw primaryErr;

      // Build probe list on same host
      let hostBase;
      try {
        const u = new URL(ocrUrl);
        hostBase = `${u.protocol}//${u.host}`;
      } catch (_) {
        hostBase = "https://api.idanalyzer.com";
      }

      const candidates = [
        "/v2/ocr",
        "/ocr",
        "/v2/ocr/scan",
        "/ocr/scan",
      ].map((p) => `${hostBase}${p}`);

      let lastErr = primaryErr;
      for (const candidate of candidates) {
        if (candidate === ocrUrl) continue;
        try {
          response = await tryPost(candidate);
          ocrUrl = candidate;
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          // Only continue probing on 404s; stop early on auth/4xx not-found-related or 5xx?
          if (!(e.response && e.response.status === 404)) {
            break;
          }
        }
      }
      if (!response) throw lastErr || primaryErr;
    }

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

    res.status(200).json({ message: "KYC verification completed", data: kycRecord, ocrUrlUsed: ocrUrl });

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        message: "Verification timed out upstream",
        timeoutMs: upstreamTimeoutMs,
        hint: "Increase IDANALYZER_TIMEOUT_MS or try smaller images",
      });
    }
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
