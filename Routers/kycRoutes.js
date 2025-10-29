const express = require('express');
const router = express.Router();
const { verifyIdentity, getKYCUser } = require('../controllers/kycController'); 
router.post('/verify', verifyIdentity);  
router.get("/getresults",getKYCUser);

module.exports = router;