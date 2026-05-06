const express = require("express");
const router = express.Router();
const controller = require("../controllers/lost.controller");

router.get("/", controller.getAllLostItems);
router.post("/", controller.createLostItem);

module.exports = router;
