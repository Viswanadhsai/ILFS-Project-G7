const express = require("express");
const router = express.Router();

const validate = require("../middleware/validation.middleware");
const { lostItemSchema } = require("../validation/lost.validation");

const {
    getLostItems,
    addLostItem,
    updateLostItem,
    deleteLostItem,
    getLostItemById
} = require("../controllers/lost.controller");

router.get("/", getLostItems);
router.get("/:id", getLostItemById);

router.post("/", validate(lostItemSchema), addLostItem);
router.put("/:id", validate(lostItemSchema), updateLostItem);

router.delete("/:id", deleteLostItem);

module.exports = router;