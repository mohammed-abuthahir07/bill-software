const {
    getTotalUsers,
    getTotalProducts,
    getTotalInvoices,
    getTotalRevenue,
    getMonthlyRevenue
} = require("../models/adminDashboard.model");

const getDashboard = async (req, res) => {

    try {

        const totalUsers = await getTotalUsers();
        const totalProducts = await getTotalProducts();
        const totalInvoices = await getTotalInvoices();
        const totalRevenue = await getTotalRevenue();
        const monthlyRevenue = await getMonthlyRevenue();

        res.json({
            totalUsers: totalUsers.totalUsers,
            totalProducts: totalProducts.totalProducts,
            totalInvoices: totalInvoices.totalInvoices,
            totalRevenue: totalRevenue.totalRevenue,
            monthlyRevenue: monthlyRevenue.monthlyRevenue
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {
    getDashboard
};