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

// Generate Certificate Route
app.post("/generate", async (req, res) => {
  try {
    const { name, event } = req.body;

    if (!name || !event) {
      return res.status(400).json({ error: "Name and Event required" });
    }

    const certificateId = uuidv4();

    // Read template image
    const imageBytes = fs.readFileSync("certificate-template.png");

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape

    const pngImage = await pdfDoc.embedPng(imageBytes);

    // Draw template image
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: 842,
      height: 595,
    });

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Draw Name (Adjust position if needed)
    page.drawText(name, {
      x: 300,
      y: 300,
      size: 40,
      font,
      color: rgb(0, 0, 0),
    });

    // Draw Event Name
    page.drawText(event, {
      x: 300,
      y: 250,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });

    // Draw Certificate ID
    page.drawText(`Certificate ID: ${certificateId}`, {
      x: 50,
      y: 50,
      size: 12,
    });

    const pdfBytes = await pdfDoc.save();

    const fileName = `${name}-certificate.pdf`;

    fs.writeFileSync(fileName, pdfBytes);

    res.json({
      message: "Certificate generated successfully",
      certificateId,
      file: fileName,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});