const {
    getAllCompanies,
    getCompanyById,
    getCompanyProducts,
    getCompanyMonthlyRevenue,
    getRecentInvoices
} = require("../models/company.model");
// =====================================
// GET ALL COMPANIES
// =====================================
const getCompanies = async (req, res) => {
    try {

        const companies = await getAllCompanies();

        res.status(200).json({
            success: true,
            totalCompanies: companies.length,
            companies,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });

    }
};

// =====================================
// GET SINGLE COMPANY
// =====================================
const getCompany = async (req, res) => {

    try {

        const { id } = req.params;

        const company = await getCompanyById(id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        const products = await getCompanyProducts(id);

        const monthlyRevenue = await getCompanyMonthlyRevenue(id);

        const recentInvoices = await getRecentInvoices(id);

        res.json({
            success: true,
            company: {
                ...company,
                totalProducts: products.totalProducts,
                monthlyRevenue: monthlyRevenue.monthlyRevenue
            },
            recentInvoices
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

module.exports = {
    getCompanies,
    getCompany,
};