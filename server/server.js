require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { connectDB } = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const billingRoutes = require("./routes/billing.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const billRoutes = require("./routes/billing.routes");
const profileRoutes = require("./routes/profile.routes");
const adminAuthRoutes = require("./routes/adminAuth.routes");
const adminDashboardRoutes = require("./routes/adminDashboard.routes");
const companyRoutes = require("./routes/company.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const forgotPasswordRoutes = require("./routes/forgotPassword.routes");
const reportRoutes = require("./routes/report.routes");
const userAnalyticsRoutes = require("./routes/userAnalytics.routes");

const app = express();
const PORT = process.env.PORT || 5000;
// ===============================
// Middlewares
// ===============================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// ===============================
// API Routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/billing", billRoutes);
app.use("/api/bills", billingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin", companyRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/analytics", userAnalyticsRoutes);

// ===============================
// 404 Route
// ===============================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found",
    });
});

// ===============================
// Start Server
// ===============================
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log("=================================");
            console.log("🚀 Billing SaaS Backend Started");
            console.log(`🌍 Server running on port ${PORT}`);
            console.log(
                `📅 Environment : ${process.env.NODE_ENV || "development"}`
            );
            console.log("=================================");
        });
    } catch (error) {
        console.error("=================================");
        console.error("❌ Failed to Start Server");
        console.error(error.message);
        console.error("=================================");
        process.exit(1);
    }
};

startServer();