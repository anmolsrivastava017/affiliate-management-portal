const express = require("express");

const {
  createApplication,
  getMyApplication,
  updateApplication,
  submitApplication,
} = require("../controllers/applicationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createApplication);
router.get("/me", protect, getMyApplication);
router.put("/:id", protect, updateApplication);
router.post("/:id/submit", protect, submitApplication);

module.exports = router;