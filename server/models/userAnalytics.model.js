const { pool } = require("../config/database");

const toNumber = (value) => {
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : 0;
};

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const fillYearMonths = (rows, currentMonth) => {
  const map = new Map(
    (rows || []).map((row) => [Number(row.monthNum), row])
  );

  return MONTH_LABELS.slice(0, currentMonth).map((month, index) => {
    const row = map.get(index + 1);
    return {
      month,
      revenue: toNumber(row?.revenue),
      invoices: Number(row?.invoices) || 0,
    };
  });
};

const mapCustomers = (rows) =>
  (rows || []).map((row) => ({
    customerName: row.customerName || "Unknown",
    invoices: Number(row.invoices) || 0,
    revenue: toNumber(row.revenue),
  }));

const getUserAnalytics = async (userId) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const summaryQuery = `
    SELECT
      IFNULL(SUM(
        CASE
          WHEN MONTH(created_at) = MONTH(CURDATE())
           AND YEAR(created_at) = YEAR(CURDATE())
          THEN grand_total ELSE 0
        END
      ), 0) AS monthRevenue,
      IFNULL(SUM(
        CASE
          WHEN YEAR(created_at) = YEAR(CURDATE())
          THEN grand_total ELSE 0
        END
      ), 0) AS yearRevenue,
      SUM(
        CASE
          WHEN MONTH(created_at) = MONTH(CURDATE())
           AND YEAR(created_at) = YEAR(CURDATE())
          THEN 1 ELSE 0
        END
      ) AS monthInvoices,
      SUM(
        CASE
          WHEN YEAR(created_at) = YEAR(CURDATE())
          THEN 1 ELSE 0
        END
      ) AS yearInvoices
    FROM invoices
    WHERE user_id = ?
  `;

  const yearSeriesQuery = `
    SELECT
      MONTH(created_at) AS monthNum,
      IFNULL(SUM(grand_total), 0) AS revenue,
      COUNT(*) AS invoices
    FROM invoices
    WHERE user_id = ?
      AND YEAR(created_at) = YEAR(CURDATE())
    GROUP BY MONTH(created_at)
    ORDER BY MONTH(created_at)
  `;

  const topCustomersQuery = `
    SELECT
      TRIM(customer_name) AS customerName,
      COUNT(*) AS invoices,
      IFNULL(SUM(grand_total), 0) AS revenue
    FROM invoices
    WHERE user_id = ?
      AND TRIM(IFNULL(customer_name, '')) <> ''
      AND YEAR(created_at) = YEAR(CURDATE())
      {{monthFilter}}
    GROUP BY TRIM(customer_name)
    ORDER BY revenue DESC, invoices DESC
    LIMIT 8
  `;

  const monthCustomersQuery = topCustomersQuery.replace(
    "{{monthFilter}}",
    "AND MONTH(created_at) = MONTH(CURDATE())"
  );
  const yearCustomersQuery = topCustomersQuery.replace("{{monthFilter}}", "");

  const [[summaryRows], [seriesRows], [monthCustomerRows], [yearCustomerRows]] =
    await Promise.all([
      pool.execute(summaryQuery, [userId]),
      pool.execute(yearSeriesQuery, [userId]),
      pool.execute(monthCustomersQuery, [userId]),
      pool.execute(yearCustomersQuery, [userId]),
    ]);

  const summary = summaryRows[0] || {};
  const yearSeries = fillYearMonths(seriesRows, currentMonth);
  const topCustomersMonth = mapCustomers(monthCustomerRows);
  const topCustomersYear = mapCustomers(yearCustomerRows);

  return {
    period: {
      month: currentMonth,
      year: currentYear,
      monthLabel: `${MONTH_LABELS[currentMonth - 1]} ${currentYear}`,
      yearLabel: String(currentYear),
    },
    summary: {
      monthRevenue: toNumber(summary.monthRevenue),
      yearRevenue: toNumber(summary.yearRevenue),
      monthInvoices: Number(summary.monthInvoices) || 0,
      yearInvoices: Number(summary.yearInvoices) || 0,
    },
    yearSeries,
    topCustomersMonth,
    topCustomersYear,
    bestCustomerMonth: topCustomersMonth[0] || null,
    bestCustomerYear: topCustomersYear[0] || null,
  };
};

module.exports = {
  getUserAnalytics,
};
