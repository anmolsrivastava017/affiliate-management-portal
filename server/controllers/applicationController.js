const Application = require("../models/Application");
const Activity = require("../models/Activity");

const createApplication = async (req, res) => {
  try {
    const existingApplication = await Application.findOne({
      userId: req.user._id,
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "Application already exists",
      });
    }

    const {
      fullName,
      email,
      phone,
      company,
      website,
      industry,
      audienceSize,
      reason,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !industry ||
      audienceSize === undefined ||
      !reason
    ) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    const application = await Application.create({
      userId: req.user._id,
      fullName,
      email,
      phone,
      company,
      website,
      industry,
      audienceSize,
      reason,
      status: "DRAFT",
    });

    res.status(201).json({
      message: "Application draft created successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getMyApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      userId: req.user._id,
    });

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

const updateApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (!["DRAFT", "CHANGES_REQUESTED"].includes(application.status)) {
      return res.status(400).json({
        message: "Application cannot be edited in its current status",
      });
    }

    const {
      fullName,
      email,
      phone,
      company,
      website,
      industry,
      audienceSize,
      reason,
    } = req.body;

    application.fullName = fullName ?? application.fullName;
    application.email = email ?? application.email;
    application.phone = phone ?? application.phone;
    application.company = company ?? application.company;
    application.website = website ?? application.website;
    application.industry = industry ?? application.industry;
    application.audienceSize = audienceSize ?? application.audienceSize;
    application.reason = reason ?? application.reason;

    await application.save();

    res.status(200).json({
      message: "Application updated successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const submitApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (!["DRAFT", "CHANGES_REQUESTED"].includes(application.status)) {
      return res.status(400).json({
        message: "Application cannot be submitted in its current status",
      });
    }

    const wasChangesRequested = application.status === "CHANGES_REQUESTED";

    application.status = "SUBMITTED";
    application.changeRequest = "";

    await application.save();

    await Activity.create({
      userId: application.userId,
      applicationId: application._id,
      action: wasChangesRequested ? "RESUBMITTED" : "SUBMITTED",
      description: wasChangesRequested
        ? "Application resubmitted after requested changes"
        : "Application submitted successfully",
    });

    res.status(200).json({
      message: wasChangesRequested
        ? "Application resubmitted successfully"
        : "Application submitted successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createApplication,
  getMyApplication,
  updateApplication,
  submitApplication,
};