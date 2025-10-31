// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const multer = require("multer");
const authRoutes = require("./Routers/authRoutes");
const kycRoutes = require("./Routers/kycRoutes");
const uploadRoutes = require("./Routers/uploadRoutes")
const upload = multer();
dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/use", kycRoutes);
app.use('/kyc', upload.fields([{ name: 'frontImage' }, { name: 'backImage' }]), kycRoutes);
app.use("/api/upload", uploadRoutes);

app.get('/', (req, res) => res.send('API online ✅'));

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  if (process.env.USE_NGROK === 'true') {
    try {
      const ngrok = require('@ngrok/ngrok');

      // old session disconnect karne ki try
      try { 
        await ngrok.disconnect(); 
        console.log("Old ngrok session closed ✅");
      } catch (e) {}

      const url = await ngrok.connect({
        addr: PORT,
        authtoken: process.env.NGROK_AUTHTOKEN
      });

      console.log(`Ngrok tunnel started ✅: ${url}`);
    } catch (err) {
      console.error('Ngrok failed to start:', err.message);
    }
  }
});

process.on('SIGINT', async () => {
  try {
    const ngrok = require('@ngrok/ngrok');
    await ngrok.disconnect();
    console.log("Ngrok disconnected safely 🔌");
  } catch (err) {}
  process.exit();
});
