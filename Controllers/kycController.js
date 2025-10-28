const dotenv = require("dotenv");
dotenv.config();

exports.verifyIdentity = (req, res) => {
    const { name, dob, documentNumber } = req.body;
    const file = req.file;
    if (!name || !dob || !documentNumber || !file) {
        return res.status(400).json({ message: "all fields are required" });
    }
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    if (age < parseInt(process.env.MINIMUM_AGE || "18")) {
        return res.status(400).json({ message: "user underage" });
    }
    return res.json({
        message: "Mock KYC success ",
        data: {
            status: "approved",
            age,
            reason: "Mock KYC successful",
            name,
            documentNumber
        }
    });
};
