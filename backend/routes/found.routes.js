const express = require("express");
const router = express.Router();

const {
    getFoundItems,
    addFoundItem,
    updateFoundItem,
    deleteFoundItem
} = require("../controllers/found.controller");

router.get("/", getFoundItems);
router.post("/", addFoundItem);
router.put("/:id", updateFoundItem);
router.delete("/:id", deleteFoundItem);

module.exports = router;
