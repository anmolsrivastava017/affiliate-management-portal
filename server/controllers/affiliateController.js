const Affiliate = require("../models/Affiliate");

const getAffiliateDashboard = async (req, res) => {
  try {
    const affiliate = await Affiliate.findOne({
      userId: req.user._id,
    }).populate("userId", "name email");

    if (!affiliate) {
      return res.status(200).json({
        affiliate: null,
      });
    }

   res.status(200).json({
  test: "NAME-CHECK",
  name: "Anmol",
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
  getAffiliateDashboard,
};