const express = require('express');
const router = express.Router();
const { verifyIdentity } = require('../controllers/kycController'); 
router.post('/verify', verifyIdentity);  

module.exports = router;