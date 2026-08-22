const {
  getMonthlySummary,
  getMonthlyInvoices,
  getAllMonthlyInvoices,
  getMonthlyProducts,
  getReportUser,
} = require("../models/report.model");
const { generateMonthlyReportPdf } = require("../utils/monthlyReportPdf");

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const resolvePeriod = (query = {}) => {
  const now = new Date();
  const month = parseInt(query.month, 10);
  const year = parseInt(query.year, 10);

  return {
    month: month >= 1 && month <= 12 ? month : now.getMonth() + 1,
    year: year >= 2000 && year <= 2100 ? year : now.getFullYear(),
  };
};

const formatReportMonth = (month, year) =>
  `${MONTH_NAMES[month - 1]} ${year}`;

const getMonthlySummaryReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = resolvePeriod(req.query);
    const summary = await getMonthlySummary(userId, month, year);

    return res.status(200).json({
      success: true,
      month,
      year,
      reportMonth: formatReportMonth(month, year),
      summary,
    });
  } catch (error) {
    console.error("Monthly Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load monthly summary.",
    });
  }
};

const getMonthlyInvoicesReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = resolvePeriod(req.query);
    const { search = "", page = 1, limit = 10 } = req.query;

    const result = await getMonthlyInvoices(userId, month, year, {
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      month,
      year,
      reportMonth: formatReportMonth(month, year),
      ...result,
    });
  } catch (error) {
    console.error("Monthly Invoices Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load monthly invoices.",
    });
  }
};

const getMonthlyProductsReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = resolvePeriod(req.query);
    const products = await getMonthlyProducts(userId, month, year);

    return res.status(200).json({
      success: true,
      month,
      year,
      reportMonth: formatReportMonth(month, year),
      products,
    });
  } catch (error) {
    console.error("Monthly Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load product sales summary.",
    });
  }
};

const downloadMonthlyPdf = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = resolvePeriod(req.query);

    const [user, summary, invoices, products] = await Promise.all([
      getReportUser(userId),
      getMonthlySummary(userId, month, year),
      getAllMonthlyInvoices(userId, month, year),
      getMonthlyProducts(userId, month, year),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const reportMonth = formatReportMonth(month, year);
    const generatedDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const pdfBuffer = await generateMonthlyReportPdf({
      userName: user.name,
      companyName: user.companyName,
      logoImage: user.profileImage,
      reportMonth,
      generatedDate,
      summary,
      invoices,
      products,
    });

    const fileName = `Monthly-Sales-Report-${MONTH_NAMES[month - 1]}-${year}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Monthly PDF Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate monthly report PDF.",
    });
  }
};

module.exports = {
  getMonthlySummaryReport,
  getMonthlyInvoicesReport,
  getMonthlyProductsReport,
  downloadMonthlyPdf,
};
