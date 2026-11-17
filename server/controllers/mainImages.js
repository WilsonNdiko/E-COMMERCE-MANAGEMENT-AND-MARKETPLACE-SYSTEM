const path = require("path");
const fs = require("fs");

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);

async function uploadMainImage(req, res) {
  if (!req.files || !req.files.uploadedFile) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const uploadedFile = req.files.uploadedFile;
  const ext = path.extname(uploadedFile.name || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return res.status(400).json({ message: "Unsupported image file type" });
  }

  const safeBase = path
    .basename(uploadedFile.name, ext)
    .replace(/[^a-zA-Z0-9._ -]/g, "_")
    .slice(0, 80);
  const safeFileName = `${safeBase}${ext}`;
  const publicDir = path.join(__dirname, "..", "..", "public");

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const targetPath = path.join(publicDir, safeFileName);

  uploadedFile.mv(targetPath, (err) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(500).json({ message: "Failed to save uploaded image" });
    }

    return res.status(200).json({
      message: "File uploaded successfully",
      filename: safeFileName,
    });
  });
}

module.exports = {
  uploadMainImage,
};
