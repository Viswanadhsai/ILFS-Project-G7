const express = require("express");
const router = express.Router();
const controller = require("../controllers/found.controller");

router.get("/", controller.getAllFoundItems);
router.post("/", controller.createFoundItem);

module.exports = router;
