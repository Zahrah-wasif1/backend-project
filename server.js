const express = require("express");
const authRoutes = require("./Routers/authRoutes");
const dotenv = require("dotenv");
const cors = require('cors');
const connectDB = require("./config/db");
const kycRoutes = require('./Routers/kycRoutes');
const multer = require('multer');
// Ngrok: loaded conditionally after server starts

const upload = multer();
const app = express();

dotenv.config();

// Middleware
app.use(cors({ origin: '*' })); 
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-KEY');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/use", upload.fields([{ name: 'frontImage' }, { name: 'backImage' }]), kycRoutes);
app.use('/kyc', upload.fields([{ name: 'frontImage' }, { name: 'backImage' }]), kycRoutes);

app.get('/', (req, res) => res.send('API online ✅'));

// Database
connectDB();

// PORT
const PORT = process.env.PORT || 5000;

// Server
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    if (process.env.USE_NGROK === 'true') {
        try {
            const ngrok = require('@ngrok/ngrok');
            const url = await ngrok.connect({
                addr: PORT,
                authtoken: process.env.NGROK_AUTHTOKEN
            });
            console.log(`Ngrok tunnel: ${url}`);
        } catch (err) {
            console.error('Ngrok failed to start:', err);
        }
    }
});
