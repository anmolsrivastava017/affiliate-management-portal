const Application = require("../models/Application");
const Affiliate = require("../models/Affiliate");
const Activity = require("../models/Activity");

const getApplications = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }

    const applications = await Application.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      applications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const getDashboardSummary = async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();

    const pendingApplications = await Application.countDocuments({
      status: {
        $in: ["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED"],
      },
    });

    const approvedAffiliates = await Application.countDocuments({
      status: "APPROVED",
    });

    const rejectedApplications = await Application.countDocuments({
      status: "REJECTED",
    });

    res.status(200).json({
      totalApplications,
      pendingApplications,
      approvedAffiliates,
      rejectedApplications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    res.status(200).json({
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const moveToReview = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (application.status !== "SUBMITTED") {
      return res.status(400).json({
        message: "Only submitted applications can be moved to review",
      });
    }

    application.status = "UNDER_REVIEW";

    await application.save();

    await Activity.create({
      userId: application.userId,
      applicationId: application._id,
      action: "UNDER_REVIEW",
      description: "Application moved to under review",
    });

    res.status(200).json({
      message: "Application moved to review",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const approveApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (!["SUBMITTED", "UNDER_REVIEW"].includes(application.status)) {
      return res.status(400).json({
        message: "Application cannot be approved in its current status",
      });
    }

    let affiliate = await Affiliate.findOne({
      userId: application.userId,
    });

    if (!affiliate) {
      const referralCode = `AFF-${Math.floor(1000 + Math.random() * 9000)}`;

      affiliate = await Affiliate.create({
        userId: application.userId,
        referralCode,
      });
    }

    application.status = "APPROVED";
    application.rejectionReason = "";
    application.changeRequest = "";

    await application.save();

    await Activity.create({
      userId: application.userId,
      applicationId: application._id,
      action: "APPROVED",
      description: `Application approved with referral code ${affiliate.referralCode}`,
    });

    res.status(200).json({
      message: "Application approved successfully",
      application,
      affiliate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (!["SUBMITTED", "UNDER_REVIEW"].includes(application.status)) {
      return res.status(400).json({
        message: "Application cannot be rejected in its current status",
      });
    }

    application.status = "REJECTED";
    application.rejectionReason = reason;
    application.changeRequest = "";

    await application.save();

    await Activity.create({
      userId: application.userId,
      applicationId: application._id,
      action: "REJECTED",
      description: `Application rejected: ${reason}`,
    });

    res.status(200).json({
      message: "Application rejected successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const requestChanges = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        message: "Change request reason is required",
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (!["SUBMITTED", "UNDER_REVIEW"].includes(application.status)) {
      return res.status(400).json({
        message: "Changes cannot be requested in its current status",
      });
    }

    application.status = "CHANGES_REQUESTED";
    application.changeRequest = reason;
    application.rejectionReason = "";

    await application.save();

    await Activity.create({
      userId: application.userId,
      applicationId: application._id,
      action: "CHANGES_REQUESTED",
      description: `Changes requested: ${reason}`,
    });

    res.status(200).json({
      message: "Changes requested successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const updateAffiliateMetrics = async (req, res) => {
  try {
    const { clicks, conversions, revenue, commissionEarned } = req.body;

    const affiliate = await Affiliate.findById(req.params.id);

    if (!affiliate) {
      return res.status(404).json({
        message: "Affiliate not found",
      });
    }

    affiliate.clicks = clicks ?? affiliate.clicks;
    affiliate.conversions = conversions ?? affiliate.conversions;
    affiliate.revenue = revenue ?? affiliate.revenue;
    affiliate.commissionEarned =
      commissionEarned ?? affiliate.commissionEarned;

    await affiliate.save();

    res.status(200).json({
      message: "Affiliate metrics updated successfully",
      affiliate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const getAffiliates = async (req, res) => {
  try {
    const affiliates = await Affiliate.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      affiliates,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateAffiliateTargets = async (req, res) => {
  try {
    const {
      monthlyClickTarget,
      monthlyConversionTarget,
      monthlyRevenueTarget,
    } = req.body;

    const affiliate = await Affiliate.findById(req.params.id);

    if (!affiliate) {
      return res.status(404).json({
        message: "Affiliate not found",
      });
    }

    affiliate.monthlyClickTarget =
      monthlyClickTarget ?? affiliate.monthlyClickTarget;
    affiliate.monthlyConversionTarget =
      monthlyConversionTarget ?? affiliate.monthlyConversionTarget;
    affiliate.monthlyRevenueTarget =
      monthlyRevenueTarget ?? affiliate.monthlyRevenueTarget;

    await affiliate.save();

    res.status(200).json({
      message: "Affiliate targets updated successfully",
      affiliate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = {
  getDashboardSummary,
  getApplications,
  getApplicationById,
  moveToReview,
  approveApplication,
  rejectApplication,
  requestChanges,
  getAffiliates,
  updateAffiliateMetrics,
  updateAffiliateTargets,
}