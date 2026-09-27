const express = require("express");

const {
  getMyActivities,
} = require("../controllers/activityController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, getMyActivities);

module.exports = router;