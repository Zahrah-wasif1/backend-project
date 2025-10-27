const express = require("express");
const authRoutes = require("./Routers/authRoutes");
const dotenv = require("dotenv");
const connectDB = require("./Config/db");

dotenv.config();
const app = express();
app.use(express.json());

app.use("/api/auth",authRoutes);

connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http:localhost${PORT}`);
});




