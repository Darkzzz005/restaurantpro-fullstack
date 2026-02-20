const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateInvoicePDF(order) {
  const invoicesDir = path.join(__dirname, "..", "invoices");
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);

  const invoiceNo = `INV-${Date.now()}`;
  const filename = `${invoiceNo}.pdf`;
  const filePath = path.join(invoicesDir, filename);

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("RestaurantPro - Invoice", { bold: true });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice No: ${invoiceNo}`);
  doc.text(`Order ID: ${order._id}`);
  doc.text(`Customer: ${order.customerName}`);
  if (order.phone) doc.text(`Phone: ${order.phone}`);
  doc.text(`Date: ${new Date().toLocaleString()}`);
  doc.moveDown();

  doc.fontSize(14).text("Items:");
  doc.moveDown(0.5);

  order.items.forEach((it) => {
    doc.fontSize(12).text(
      `${it.name}  x${it.quantity}  @ ₹${it.price}  = ₹${it.price * it.quantity}`
    );
  });

  doc.moveDown();
  doc.fontSize(14).text(`Total: ₹${order.totalAmount}`, { bold: true });
  doc.moveDown();

  doc.fontSize(12).text(`Payment Status: ${order.paymentStatus}`);
  doc.text(`Payment Method: ${order.paymentMethod}`);
  if (order.gatewayPaymentId) doc.text(`Txn: ${order.gatewayPaymentId}`);

  doc.end();

  // public URL (served as static)
  return { invoiceNo, invoiceUrl: `/invoices/${filename}` };
}

module.exports = { generateInvoicePDF };
