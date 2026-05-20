const express = require("express");
const serviceRecordController = require("../controllers/serviceRecordController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", serviceRecordController.list);
router.post("/", serviceRecordController.create);
router.delete("/:id", serviceRecordController.remove);

module.exports = router;
