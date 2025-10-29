const express = require("express");
const authRoutes = require("./Routers/authRoutes");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const kycRoutes = require('./Routers/kycRoutes');
const multer = require('multer');
const upload = multer();

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/use", upload.fields([{ name: 'frontImage' }, { name: 'backImage' }]), kycRoutes);

app.use('/kyc', upload.fields([{ name: 'frontImage' }, { name: 'backImage' }]), require('./Routers/kycRoutes'));
app.get('/', (req, res) => res.send('API online ✅'));
app.get('/api/hello', (req, res) => res.json({ ok: true, msg: 'Hello from Glitch' }));

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
