const analyticsModel = require("../models/analytics.model");

// ===============================
// Users Analytics
// ===============================
const usersAnalytics = async (req,res)=>{
    try {
        const data = await analyticsModel.getUsersAnalytics();
        res.status(200).json(data);
    } catch(error){
        res.status(500).json({
            success:false,
            message:"Failed to fetch user analytics",
            error:error.message
        });
    }
};

// ===============================
// Revenue Analytics
// ===============================
const revenueAnalytics = async(req,res)=>{
    try {
        const data = await analyticsModel.getRevenueAnalytics();
        res.status(200).json(data);
    }catch(error){
        res.status(500).json({
            success:false,
            message:"Failed to fetch revenue analytics",
            error:error.message
        });
    }
};




// ===============================
// Invoice Analytics
// ===============================
const invoiceAnalytics = async(req,res)=>{
    try{
        const data = await analyticsModel.getInvoiceAnalytics();
        res.status(200).json(data);
    }catch(error){
        res.status(500).json({
            success:false,
            message:"Failed to fetch invoice analytics",
            error:error.message
        });
    }
};

// ===============================
// Product Analytics
// ===============================
const productAnalytics = async(req,res)=>{
    try{
        const data = await analyticsModel.getProductAnalytics();
        res.status(200).json(data);
    }catch(error){
        res.status(500).json({
            success:false,
            message:"Failed to fetch product analytics",
            error:error.message
        });
    }
};

module.exports = {
    usersAnalytics,
    revenueAnalytics,
    invoiceAnalytics,
    productAnalytics
};