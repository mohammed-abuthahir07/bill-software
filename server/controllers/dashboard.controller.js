const {
  getTotalProducts,
  getTotalStock,
  getTodaySales,
  getMonthlySales,
  getYearlySales,
  getTotalRevenue,
  getTotalBills,
  getRecentBills,
  getLowStockProducts,
  getBestSellingProducts,
} = require("../models/dashboard.model");

// ======================================
// Dashboard
// ======================================
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalProducts,
      totalStock,
      todaySales,
      monthlySales,
      yearlySales,
      totalRevenue,
      totalBills,
      recentBills,
      lowStockProducts,
      bestSellingProducts,
    ] = await Promise.all([
      getTotalProducts(userId),
      getTotalStock(userId),
      getTodaySales(userId),
      getMonthlySales(userId),
      getYearlySales(userId),
      getTotalRevenue(userId),
      getTotalBills(userId),
      getRecentBills(userId),
      getLowStockProducts(userId),
      getBestSellingProducts(userId),
    ]);

    return res.status(200).json({
      success: true,

      dashboard: {
        totalProducts: totalProducts.totalProducts,
        totalStock: totalStock.totalStock,
        todaySales: todaySales.todaySales,
        monthlySales: monthlySales.monthlySales,
        yearlySales: yearlySales.yearlySales,
        totalRevenue: totalRevenue.totalRevenue,
        totalBills: totalBills.totalBills,
      },

      recentBills,
      lowStockProducts,
      bestSellingProducts,
    });

  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getDashboard,
};