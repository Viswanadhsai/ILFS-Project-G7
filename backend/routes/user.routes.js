const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/user.controller');

router.get('/login', (req, res) => {
    res.json({ message: "Login endpoint active. Use POST to log in." });
});

router.get('/register', (req, res) => {
    res.json({ message: "Register endpoint active. Use POST to register." });
});

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
