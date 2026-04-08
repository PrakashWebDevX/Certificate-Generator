const express = require("express");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Certificate Automation Running 🚀");
});

// Generate certificate
app.post("/generate", async (req, res) => {
  try {
    const { name, event } = req.body;

    if (!name || !event) {
      return res.status(400).json({ error: "Name and Event are required" });
    }

    const certificateId = uuidv4();

    // Read template
    const imageBytes = fs.readFileSync("certificate-template.png");

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]);

    const pngImage = await pdfDoc.embedPng(imageBytes);

    // Draw certificate background
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: 842,
      height: 595
    });

    // Elegant font
    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    // GOLD color for name
    const gold = rgb(0.83, 0.68, 0.21);

    const fontSize = 42;

    // AUTO CENTER NAME
    const textWidth = font.widthOfTextAtSize(name, fontSize);
    const centerX = (842 - textWidth) / 2;

    page.drawText(name, {
      x: centerX,
      y: 300,
      size: fontSize,
      font: font,
      color: gold
    });

    // Event text (white)
    const eventText = `for completing "${event}"`;

    const eventFontSize = 20;
    const eventWidth = font.widthOfTextAtSize(eventText, eventFontSize);
    const eventX = (842 - eventWidth) / 2;

    page.drawText(eventText, {
  x: eventX,
  y: 240,
  size: eventFontSize,
  font: font,
  color: rgb(1, 1, 1) // WHITE
});

page.drawText(`Certificate ID: ${certificateId}`, {
  x: 60,
  y: 60,
  size: 12,
  color: rgb(1, 1, 1) // WHITE
});

    const pdfBytes = await pdfDoc.save();

    const fileName = `${name}-certificate.pdf`;

    fs.writeFileSync(fileName, pdfBytes);

    res.json({
      message: "Certificate Generated Successfully 🎉",
      certificateId: certificateId,
      file: fileName
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Certificate generation failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});
