const { getUserAnalytics } = require("../models/userAnalytics.model");

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await getUserAnalytics(userId);

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("User analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load analytics.",
    });
  }
};

module.exports = {
  getAnalytics,
};
