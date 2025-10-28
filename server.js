const express = require("express");
const authRoutes = require("./Routers/authRoutes");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const kycRoutes = require('./Routers/kycRoutes');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/use", kycRoutes);


connectDB();


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
