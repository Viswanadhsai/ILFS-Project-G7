const express = require("express");
const router = express.Router();

const {
    getFoundItems,
    addFoundItem,
    updateFoundItem
} = require("../controllers/found.controller");

router.get("/", getFoundItems);
router.post("/", addFoundItem);
router.put("/:id", updateFoundItem);

module.exports = router;
