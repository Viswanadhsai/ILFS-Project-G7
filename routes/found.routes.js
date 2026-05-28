const express = require("express");
const router = express.Router();

const validate = require("../middleware/validation.middleware");
const { foundItemSchema } = require("../validation/found.validation");

const {
    getFoundItems,
    addFoundItem,
    updateFoundItem,
    deleteFoundItem,
    getFoundItemById
} = require("../controllers/found.controller");

router.get("/", getFoundItems);
router.get("/:id", getFoundItemById);

router.post("/", validate(foundItemSchema), addFoundItem);
router.put("/:id", validate(foundItemSchema), updateFoundItem);

router.delete("/:id", deleteFoundItem);

module.exports = router;