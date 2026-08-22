const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const COLORS = {
  navy: "#0F172A",
  blue: "#2563EB",
  blueSoft: "#EFF6FF",
  slate: "#64748B",
  muted: "#94A3B8",
  text: "#0F172A",
  border: "#E2E8F0",
  light: "#F8FAFC",
  white: "#FFFFFF",
  green: "#059669",
};

const PAGE_MARGIN = 48;
const HEADER_HEIGHT = 112;

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return `Rs. ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatQty = (value) => {
  const num = Number(value) || 0;
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
};

const splitColumns = (contentWidth, ratios) => {
  const widths = ratios.map((ratio) => Math.floor(contentWidth * ratio));
  const used = widths.reduce((sum, width) => sum + width, 0);
  widths[widths.length - 1] += contentWidth - used;
  return widths;
};

const resolveLogoFile = (profileImage) => {
  if (!profileImage || typeof profileImage !== "string") return null;

  let pathname = profileImage.trim();
  try {
    if (/^https?:\/\//i.test(pathname)) {
      pathname = new URL(pathname).pathname;
    }
  } catch {
    return null;
  }

  pathname = pathname.split("?")[0];
  const marker = "/uploads/";
  const index = pathname.indexOf(marker);
  if (index === -1) return null;

  const relative = pathname.slice(index + 1).replace(/\\/g, "/");
  const diskPath = path.join(__dirname, "..", relative);
  if (!fs.existsSync(diskPath)) return null;

  const ext = path.extname(diskPath).toLowerCase();
  if (![".png", ".jpg", ".jpeg"].includes(ext)) return null;
  return diskPath;
};

const drawHeader = (doc, { reportMonth, generatedDate, userName, companyName, logoImage }) => {
  const width = doc.page.width;
  const logoFile = resolveLogoFile(logoImage);
  const logoSize = 56;
  const textX = PAGE_MARGIN + (logoFile ? logoSize + 14 : 0);
  const metaX = width / 2 + 24;
  const metaValueX = metaX + 92;
  const metaValueWidth = width - PAGE_MARGIN - metaValueX;

  doc.save();
  doc.rect(0, 0, width, HEADER_HEIGHT).fill(COLORS.navy);
  doc.rect(0, HEADER_HEIGHT - 4, width, 4).fill(COLORS.blue);

  if (logoFile) {
    try {
      const logoY = (HEADER_HEIGHT - logoSize) / 2 - 2;
      doc.save();
      doc.roundedRect(PAGE_MARGIN, logoY, logoSize, logoSize, 8).clip();
      doc.image(logoFile, PAGE_MARGIN, logoY, {
        fit: [logoSize, logoSize],
        align: "center",
        valign: "center",
      });
      doc.restore();
    } catch {
      // Keep the text header if the image cannot be embedded.
    }
  }

  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(20)
    .text(companyName || "Billing SaaS", textX, 22, {
      width: metaX - textX - 12,
      ellipsis: true,
      lineBreak: false,
    });

  doc
    .fillColor("#93C5FD")
    .font("Helvetica")
    .fontSize(11)
    .text("Monthly Sales Report", textX, 50, {
      width: metaX - textX - 12,
      lineBreak: false,
    });

  doc.fillColor("#CBD5E1").font("Helvetica").fontSize(9);
  doc.text("Generated Date", metaX, 22, { lineBreak: false });
  doc.text("Report Month", metaX, 48, { lineBreak: false });
  doc.text("User Name", metaX, 74, { lineBreak: false });

  doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(10);
  doc.text(generatedDate, metaValueX, 22, {
    width: metaValueWidth,
    ellipsis: true,
    lineBreak: false,
  });
  doc.text(reportMonth, metaValueX, 48, {
    width: metaValueWidth,
    ellipsis: true,
    lineBreak: false,
  });
  doc.text(userName || "—", metaValueX, 74, {
    width: metaValueWidth,
    ellipsis: true,
    lineBreak: false,
  });
  doc.restore();
};

const drawSectionTitle = (doc, title, y) => {
  doc
    .fillColor(COLORS.navy)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(title, PAGE_MARGIN, y);

  const titleWidth = doc.widthOfString(title);
  doc
    .moveTo(PAGE_MARGIN, y + 16)
    .lineTo(PAGE_MARGIN + Math.max(titleWidth, 120), y + 16)
    .lineWidth(1.5)
    .strokeColor(COLORS.blue)
    .stroke();

  return y + 28;
};

const ensureSpace = (doc, y, needed) => {
  const bottom = doc.page.height - 62;
  if (y + needed <= bottom) return y;

  doc.addPage();
  return PAGE_MARGIN + 8;
};

const drawSummaryCards = (doc, y, summary) => {
  const cards = [
    { label: "Total Revenue This Month", value: formatCurrency(summary.totalRevenue) },
    { label: "Total Sales This Month", value: formatQty(summary.totalSales) },
    { label: "Total Invoices This Month", value: String(summary.totalInvoices || 0) },
    { label: "Average Invoice Value", value: formatCurrency(summary.averageInvoiceValue) },
    {
      label: "Best Selling Product",
      value: summary.bestSellingProduct?.productName || "—",
    },
  ];

  const gap = 10;
  const contentWidth = doc.page.width - PAGE_MARGIN * 2;
  const topWidths = splitColumns(contentWidth - gap * 2, [1 / 3, 1 / 3, 1 / 3]);
  const bottomWidths = splitColumns(contentWidth - gap, [0.5, 0.5]);
  const cardHeight = 58;
  let x = PAGE_MARGIN;
  let rowY = y;

  cards.forEach((card, index) => {
    if (index === 3) {
      rowY += cardHeight + gap;
      x = PAGE_MARGIN;
    }

    const width = index >= 3 ? bottomWidths[index - 3] : topWidths[index];

    doc.roundedRect(x, rowY, width, cardHeight, 6).fill(COLORS.light);
    doc
      .roundedRect(x, rowY, 4, cardHeight, 2)
      .fill(COLORS.blue);

    doc
      .fillColor(COLORS.slate)
      .font("Helvetica")
      .fontSize(8)
      .text(card.label.toUpperCase(), x + 14, rowY + 12, {
        width: width - 22,
      });

    doc
      .fillColor(COLORS.navy)
      .font("Helvetica-Bold")
      .fontSize(index === 4 ? 11 : 13)
      .text(card.value, x + 14, rowY + 28, {
        width: width - 22,
        ellipsis: true,
      });

    x += width + gap;
  });

  return rowY + cardHeight + 22;
};

const drawTable = (doc, y, { headers, rows, columnWidths, aligns }) => {
  const startX = PAGE_MARGIN;
  const rowHeight = 22;
  const headerHeight = 24;
  const tableWidth = columnWidths.reduce((sum, w) => sum + w, 0);

  const drawHeaderRow = (headerY) => {
    doc.save();
    doc.rect(startX, headerY, tableWidth, headerHeight).fill(COLORS.navy);
    let colX = startX;
    headers.forEach((header, i) => {
      doc
        .fillColor(COLORS.white)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(header.toUpperCase(), colX + 8, headerY + 8, {
          width: columnWidths[i] - 16,
          align: aligns[i] || "left",
        });
      colX += columnWidths[i];
    });
    doc.restore();
    return headerY + headerHeight;
  };

  let cursorY = ensureSpace(doc, y, headerHeight + rowHeight);
  cursorY = drawHeaderRow(cursorY);

  if (!rows.length) {
    doc.rect(startX, cursorY, tableWidth, rowHeight).fill(COLORS.light);
    doc
      .fillColor(COLORS.slate)
      .font("Helvetica")
      .fontSize(9)
      .text("No records for this month.", startX + 8, cursorY + 7, {
        width: tableWidth - 16,
      });
    return cursorY + rowHeight + 16;
  }

  rows.forEach((row, rowIndex) => {
    cursorY = ensureSpace(doc, cursorY, rowHeight + 4);
    if (cursorY === PAGE_MARGIN + 8) {
      cursorY = drawHeaderRow(cursorY);
    }

    if (rowIndex % 2 === 0) {
      doc.rect(startX, cursorY, tableWidth, rowHeight).fill(COLORS.light);
    }

    doc
      .moveTo(startX, cursorY + rowHeight)
      .lineTo(startX + tableWidth, cursorY + rowHeight)
      .lineWidth(0.4)
      .strokeColor(COLORS.border)
      .stroke();

    let colX = startX;
    row.forEach((cell, i) => {
      doc
        .fillColor(COLORS.text)
        .font("Helvetica")
        .fontSize(8.5)
        .text(String(cell ?? "—"), colX + 8, cursorY + 6, {
          width: columnWidths[i] - 16,
          align: aligns[i] || "left",
          ellipsis: true,
        });
      colX += columnWidths[i];
    });

    cursorY += rowHeight;
  });

  return cursorY + 18;
};

const drawTotals = (doc, y, summary) => {
  const boxHeight = 92;
  const boxWidth = doc.page.width - PAGE_MARGIN * 2;
  y = ensureSpace(doc, y, boxHeight + 8);

  doc.roundedRect(PAGE_MARGIN, y, boxWidth, boxHeight, 8).fill(COLORS.blueSoft);
  doc.roundedRect(PAGE_MARGIN, y, 5, boxHeight, 2).fill(COLORS.blue);

  const items = [
    { label: "Total Revenue", value: formatCurrency(summary.totalRevenue) },
    { label: "Total GST Collected", value: formatCurrency(summary.totalGst) },
    { label: "Total Products Sold", value: formatQty(summary.totalSales) },
    { label: "Total Invoices", value: String(summary.totalInvoices || 0) },
  ];

  const colWidth = boxWidth / 4;
  items.forEach((item, index) => {
    const x = PAGE_MARGIN + colWidth * index;
    doc
      .fillColor(COLORS.slate)
      .font("Helvetica")
      .fontSize(8)
      .text(item.label.toUpperCase(), x + 18, y + 24, { width: colWidth - 28 });
    doc
      .fillColor(COLORS.navy)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(item.value, x + 18, y + 46, { width: colWidth - 28 });
  });

  return y + boxHeight + 12;
};

const addFooters = (doc) => {
  const range = doc.bufferedPageRange();

  for (let i = 0; i < range.count; i += 1) {
    doc.switchToPage(i);
    const y = doc.page.height - 36;
    const width = doc.page.width;

    doc
      .moveTo(PAGE_MARGIN, y - 8)
      .lineTo(width - PAGE_MARGIN, y - 8)
      .lineWidth(0.8)
      .strokeColor(COLORS.border)
      .stroke();

    doc
      .fillColor(COLORS.slate)
      .font("Helvetica")
      .fontSize(8)
      .text("Generated by Billing SaaS", PAGE_MARGIN, y, {
        lineBreak: false,
      });

    doc.text(`Page ${i + 1} of ${range.count}`, PAGE_MARGIN, y, {
      width: width - PAGE_MARGIN * 2,
      align: "right",
    });
  }
};

  const generateMonthlyReportPdf = (payload) => {
  const {
    userName,
    companyName,
    logoImage,
    reportMonth,
    generatedDate,
    summary,
    invoices,
    products,
  } = payload;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: PAGE_MARGIN,
      bufferPages: true,
      info: {
        Title: `Monthly Sales Report — ${reportMonth}`,
        Author: "Billing SaaS",
        Creator: "Billing SaaS",
      },
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const contentWidth = doc.page.width - PAGE_MARGIN * 2;

    drawHeader(doc, { reportMonth, generatedDate, userName, companyName, logoImage });

    let y = HEADER_HEIGHT + 24;
    y = drawSectionTitle(doc, "Monthly Summary", y);
    y = drawSummaryCards(doc, y, summary);

    y = drawSectionTitle(doc, "Invoice List", y);
    y = drawTable(doc, y, {
      headers: ["Invoice Number", "Customer Name", "Invoice Date", "Amount"],
      columnWidths: splitColumns(contentWidth, [0.24, 0.34, 0.22, 0.2]),
      aligns: ["left", "left", "left", "right"],
      rows: invoices.map((invoice) => [
        invoice.invoiceNumber,
        invoice.customerName,
        formatDate(invoice.invoiceDate),
        formatCurrency(invoice.totalAmount),
      ]),
    });

    y = drawSectionTitle(doc, "Product Sales Summary", y);
    y = drawTable(doc, y, {
      headers: ["Product Name", "Quantity Sold", "Revenue Generated"],
      columnWidths: splitColumns(contentWidth, [0.5, 0.22, 0.28]),
      aligns: ["left", "right", "right"],
      rows: products.map((product) => [
        product.productName,
        formatQty(product.quantitySold),
        formatCurrency(product.revenueGenerated),
      ]),
    });

    y = drawSectionTitle(doc, "Monthly Totals", y);
    drawTotals(doc, y, summary);

    addFooters(doc);
    doc.end();
  });
};

module.exports = {
  generateMonthlyReportPdf,
};
