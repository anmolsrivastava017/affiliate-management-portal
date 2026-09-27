const Activity = require("../models/Activity");

const getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      activities,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getMyActivities,
};