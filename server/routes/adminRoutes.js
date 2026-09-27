const express = require("express");

const {
  getDashboardSummary,
  getAffiliates,
  getApplications,
  getApplicationById,
  moveToReview,
  approveApplication,
  rejectApplication,
  requestChanges,
  updateAffiliateMetrics,
  updateAffiliateTargets,
} = require("../controllers/adminController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getDashboardSummary);
router.get("/affiliates", protect, adminOnly, getAffiliates);

router.get("/applications", protect, adminOnly, getApplications);
router.get("/applications/:id", protect, adminOnly, getApplicationById);
router.put("/applications/:id/review", protect, adminOnly, moveToReview);
router.put("/applications/:id/approve", protect, adminOnly, approveApplication);
router.put("/applications/:id/reject", protect, adminOnly, rejectApplication);
router.put("/applications/:id/request-changes", protect, adminOnly, requestChanges);
router.put("/affiliates/:id/metrics", protect, adminOnly, updateAffiliateMetrics);
router.put("/affiliates/:id/targets", protect, adminOnly, updateAffiliateTargets);

module.exports = router;