import PDFDocument from "pdfkit";
import fs from "fs";

/**
 * Generate BiteNest Invoice PDF
 *
 * @param {Object} invoice - Invoice data
 * @param {String|null} logoPath - Absolute path to BiteNest logo
 * @returns {Promise<Buffer>} PDF as Buffer
 */
const generateInvoicePdf = async (invoice, logoPath = null) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 45,
        bufferPages: true,

        info: {
          Title: `BiteNest Invoice ${invoice.invoiceNumber}`,
          Author: "BiteNest",
          Subject: "BiteNest Restaurant Invoice",
          Creator: "BiteNest Restaurant Management System",
        },
      });

      const chunks = [];

      // Collect PDF data
      doc.on("data", (chunk) => {
        chunks.push(chunk);
      });

      // PDF completed
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      // PDF error
      doc.on("error", (error) => {
        reject(error);
      });

      // ═══════════════════════════════════════════════════════════════════════
      // COLORS
      // ═══════════════════════════════════════════════════════════════════════

      const COLORS = {
        primary: "#E63946",
        dark: "#1F2937",
        gray: "#6B7280",
        lightGray: "#F3F4F6",
        border: "#D1D5DB",
        white: "#FFFFFF",
        green: "#15803D",
        red: "#DC2626",
      };

      // ═══════════════════════════════════════════════════════════════════════
      // HELPERS
      // ═══════════════════════════════════════════════════════════════════════

      const safeText = (value, fallback = "") => {
        if (value === null || value === undefined || value === "") {
          return fallback;
        }

        return String(value);
      };

      const money = (value) => {
        return `Rs. ${Number(value || 0).toFixed(2)}`;
      };

      const drawHorizontalLine = (
        y,
        x1 = 45,
        x2 = 550,
        color = COLORS.border,
      ) => {
        doc
          .moveTo(x1, y)
          .lineTo(x2, y)
          .strokeColor(color)
          .lineWidth(0.7)
          .stroke();
      };

      const drawSectionTitle = (title, y) => {
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor(COLORS.dark)
          .text(title, 45, y);

        drawHorizontalLine(y + 18);
      };

      // ═══════════════════════════════════════════════════════════════════════
      // HEADER
      // ═══════════════════════════════════════════════════════════════════════

      const headerY = 45;

      // Logo
      if (logoPath) {
        if (fs.existsSync(logoPath)) {
          try {
            doc.image(logoPath, 45, headerY, {
              fit: [80, 65],
              align: "left",
              valign: "center",
            });
          } catch (logoError) {
            console.error(
              "⚠️ Failed to add BiteNest logo to PDF:",
              logoError.message,
            );
          }
        } else {
          console.warn(`⚠️ BiteNest logo not found at: ${logoPath}`);
        }
      }

      // BiteNest name
      doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .fillColor(COLORS.primary)
        .text("BiteNest", 140, 48);

      // Subtitle
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.gray)
        .text("Restaurant Management System", 140, 76);

      // Invoice title
      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .fillColor(COLORS.dark)
        .text("INVOICE", 390, 48, {
          width: 160,
          align: "right",
        });

      // Invoice number
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.gray)
        .text(safeText(invoice.invoiceNumber, "N/A"), 390, 76, {
          width: 160,
          align: "right",
        });

      drawHorizontalLine(115);

      // ═══════════════════════════════════════════════════════════════════════
      // RESTAURANT DETAILS
      // ═══════════════════════════════════════════════════════════════════════

      let restaurantY = 140;

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(COLORS.primary)
        .text("FROM", 45, restaurantY);

      restaurantY += 18;

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(COLORS.dark)
        .text(
          safeText(invoice.restaurant?.name, "Restaurant"),
          45,
          restaurantY,
          {
            width: 230,
          },
        );

      restaurantY += 18;

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.gray)
        .text(
          safeText(invoice.restaurant?.address, "Address not available"),
          45,
          restaurantY,
          {
            width: 230,
          },
        );

      restaurantY += 32;

      doc.text(
        `Phone: ${safeText(invoice.restaurant?.phone, "N/A")}`,
        45,
        restaurantY,
        {
          width: 230,
        },
      );

      restaurantY += 14;

      doc.text(
        `Email: ${safeText(invoice.restaurant?.email, "N/A")}`,
        45,
        restaurantY,
        {
          width: 230,
        },
      );

      // ═══════════════════════════════════════════════════════════════════════
      // CUSTOMER DETAILS
      // ═══════════════════════════════════════════════════════════════════════

      let customerY = 140;

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(COLORS.primary)
        .text("BILL TO", 320, customerY);

      customerY += 18;

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(COLORS.dark)
        .text(safeText(invoice.customer?.name, "Guest"), 320, customerY, {
          width: 230,
        });

      customerY += 18;

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.gray)
        .text(
          safeText(invoice.customer?.address, "Address not available"),
          320,
          customerY,
          {
            width: 230,
          },
        );

      customerY += 32;

      doc.text(
        `Phone: ${safeText(invoice.customer?.phone, "N/A")}`,
        320,
        customerY,
        {
          width: 230,
        },
      );

      customerY += 14;

      doc.text(
        `Email: ${safeText(invoice.customer?.email, "N/A")}`,
        320,
        customerY,
        {
          width: 230,
        },
      );

      // ═══════════════════════════════════════════════════════════════════════
      // ORDER INFORMATION
      // ═══════════════════════════════════════════════════════════════════════

      let y = 255;

      drawSectionTitle("ORDER INFORMATION", y);

      y += 30;

      const orderInfo = [
        {
          label: "Invoice Date",
          value: safeText(invoice.invoiceDate, "N/A"),
          x: 45,
          width: 110,
        },
        {
          label: "Order Date",
          value: safeText(invoice.orderDate, "N/A"),
          x: 170,
          width: 110,
        },
        {
          label: "Order ID",
          value: safeText(invoice.orderId, "N/A"),
          x: 295,
          width: 135,
        },
        {
          label: "Payment",
          value: safeText(invoice.paymentMethod, "N/A"),
          x: 440,
          width: 110,
        },
      ];

      orderInfo.forEach((item) => {
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(COLORS.gray)
          .text(item.label, item.x, y);

        doc
          .font("Helvetica-Bold")
          .fontSize(8.5)
          .fillColor(COLORS.dark)
          .text(item.value, item.x, y + 13, {
            width: item.width,
            ellipsis: true,
          });
      });

      y += 50;

      // ═══════════════════════════════════════════════════════════════════════
      // ORDER ITEMS
      // ═══════════════════════════════════════════════════════════════════════

      drawSectionTitle("ORDER ITEMS", y);

      y += 28;

      const tableX = 45;
      const tableWidth = 505;
      const headerHeight = 25;

      // Table header
      doc
        .rect(tableX, y, tableWidth, headerHeight)
        .fillColor(COLORS.primary)
        .fill();

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(COLORS.white)
        .text("ITEM", 55, y + 8);

      doc.text("QTY", 320, y + 8, {
        width: 50,
        align: "center",
      });

      doc.text("UNIT PRICE", 380, y + 8, {
        width: 75,
        align: "right",
      });

      doc.text("TOTAL", 465, y + 8, {
        width: 75,
        align: "right",
      });

      y += headerHeight;

      const items = Array.isArray(invoice.items) ? invoice.items : [];

      if (items.length === 0) {
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(COLORS.gray)
          .text("No items found", 55, y + 10);

        y += 30;
      } else {
        items.forEach((item, index) => {
          const rowHeight = 28;

          // New page if there isn't enough space
          if (y > 710) {
            doc.addPage();

            y = 50;

            doc
              .font("Helvetica-Bold")
              .fontSize(14)
              .fillColor(COLORS.primary)
              .text("BiteNest Invoice", 45, y);

            y += 30;

            // Repeat table header
            doc
              .rect(tableX, y, tableWidth, headerHeight)
              .fillColor(COLORS.primary)
              .fill();

            doc
              .font("Helvetica-Bold")
              .fontSize(8)
              .fillColor(COLORS.white)
              .text("ITEM", 55, y + 8);

            doc.text("QTY", 320, y + 8, {
              width: 50,
              align: "center",
            });

            doc.text("UNIT PRICE", 380, y + 8, {
              width: 75,
              align: "right",
            });

            doc.text("TOTAL", 465, y + 8, {
              width: 75,
              align: "right",
            });

            y += headerHeight;
          }

          // Alternating row background
          if (index % 2 === 0) {
            doc
              .rect(tableX, y, tableWidth, rowHeight)
              .fillColor(COLORS.lightGray)
              .fill();
          }

          // Item name
          doc
            .font("Helvetica")
            .fontSize(8.5)
            .fillColor(COLORS.dark)
            .text(safeText(item.name, "Item"), 55, y + 9, {
              width: 250,
              ellipsis: true,
            });

          // Quantity
          doc.text(String(Number(item.quantity || 0)), 320, y + 9, {
            width: 50,
            align: "center",
          });

          // Unit price
          doc.text(money(item.unitPrice), 380, y + 9, {
            width: 75,
            align: "right",
          });

          // Total
          doc.text(money(item.total), 465, y + 9, {
            width: 75,
            align: "right",
          });

          y += rowHeight;

          drawHorizontalLine(y, tableX, tableX + tableWidth, "#E5E7EB");
        });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // TOTALS
      // ═══════════════════════════════════════════════════════════════════════

      y += 20;

      // Make sure totals don't get cut off
      if (y > 690) {
        doc.addPage();
        y = 55;
      }

      const totalsLabelX = 350;
      const totalsValueX = 455;

      const drawTotalRow = (label, value, bold = false) => {
        doc
          .font(bold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(bold ? 10 : 9)
          .fillColor(bold ? COLORS.dark : COLORS.gray)
          .text(label, totalsLabelX, y, {
            width: 95,
            align: "right",
          });

        doc
          .font(bold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(bold ? 10 : 9)
          .fillColor(bold ? COLORS.dark : COLORS.gray)
          .text(value, totalsValueX, y, {
            width: 95,
            align: "right",
          });

        y += bold ? 22 : 18;
      };

      drawTotalRow("Subtotal", money(invoice.subtotal));

      drawTotalRow("Tax", money(invoice.tax));

      drawTotalRow("Delivery Charge", money(invoice.deliveryCharge));

      drawTotalRow("Discount", `- ${money(invoice.discount)}`);

      y += 5;

      // Grand total box
      doc.roundedRect(345, y, 205, 40, 4).fillColor(COLORS.lightGray).fill();

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(COLORS.dark)
        .text("GRAND TOTAL", 357, y + 14);

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(COLORS.primary)
        .text(money(invoice.total), 455, y + 13, {
          width: 85,
          align: "right",
        });

      y += 62;

      // ═══════════════════════════════════════════════════════════════════════
      // PAYMENT DETAILS
      // ═══════════════════════════════════════════════════════════════════════

      // If not enough room, create a new page
      if (y > 700) {
        doc.addPage();
        y = 55;
      }

      drawSectionTitle("PAYMENT DETAILS", y);

      y += 30;

      // Payment method
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(COLORS.gray)
        .text("Payment Method", 45, y);

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(COLORS.dark)
        .text(safeText(invoice.paymentMethod, "Not specified"), 45, y + 14);

      // Payment status
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(COLORS.gray)
        .text("Payment Status", 220, y);

      const paymentStatus = safeText(invoice.paymentStatus, "Pending");

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(
          paymentStatus.toLowerCase() === "paid" ? COLORS.green : COLORS.dark,
        )
        .text(paymentStatus.toUpperCase(), 220, y + 14);

      // Order status
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(COLORS.gray)
        .text("Order Status", 390, y);

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(COLORS.dark)
        .text(safeText(invoice.status, "Pending").toUpperCase(), 390, y + 14);

      y += 55;

      // ═══════════════════════════════════════════════════════════════════════
      // FOOTER
      // ═══════════════════════════════════════════════════════════════════════

      // Only add footer if enough space
      if (y < 740) {
        drawHorizontalLine(y);

        y += 18;

        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor(COLORS.primary)
          .text("Thank you for ordering from BiteNest!", 45, y, {
            width: 505,
            align: "center",
          });

        y += 18;

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(COLORS.gray)
          .text(
            "This is a computer-generated invoice and does not require a signature.",
            45,
            y,
            {
              width: 505,
              align: "center",
            },
          );

        y += 13;

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(COLORS.gray)
          .text("BiteNest — Your food, your way.", 45, y, {
            width: 505,
            align: "center",
          });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PAGE NUMBERS
      // ═══════════════════════════════════════════════════════════════════════

      const pageRange = doc.bufferedPageRange();

      for (
        let pageIndex = pageRange.start;
        pageIndex < pageRange.start + pageRange.count;
        pageIndex++
      ) {
        doc.switchToPage(pageIndex);

        doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor(COLORS.gray)
          .text(
            `Page ${pageIndex - pageRange.start + 1} of ${pageRange.count}`,
            45,
            805,
            {
              width: 505,
              align: "right",
            },
          );
      }

      // Finish PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export { generateInvoicePdf };
