const express = require("express");

const {
  getAffiliateDashboard,
} = require("../controllers/affiliateController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", protect, getAffiliateDashboard);

module.exports = router;