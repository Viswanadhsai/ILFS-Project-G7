const express = require('express');
const router = express.Router();
const { submitRating } = require('../controllers/rating.controller');

router.post('/rating', submitRating);

module.exports = router;
