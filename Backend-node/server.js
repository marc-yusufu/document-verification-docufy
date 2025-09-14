// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import mongoose from "mongoose";
import sgMail from "@sendgrid/mail";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Import your Mongoose model (adjust path if needed)
import Document from "./models/Document.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ----------------------
// MongoDB Connection
// ----------------------
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.MONGO_DB_NAME || "eDocufy_database",
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ----------------------
// File Uploads (Multer)
// ----------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ----------------------
// File Serving
// ----------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/documents", express.static(join(__dirname, "uploads")));

// Helper to generate file URLs
const getFileUrl = (req, filePath) => {
  const cleanPath = filePath.replace(/^uploads[\\/]/, "");
  return `${req.protocol}://${req.get("host")}/documents/${cleanPath}`;
};

// ----------------------
// Health Check Routes
// ----------------------
app.get("/", (req, res) =>
  res.json({ success: true, message: "Backend running!" })
);
app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "Server healthy" })
);

// ----------------------
// SendGrid Setup
// ----------------------
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// OTP Route
app.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, error: "Email and OTP required" });
  }

  try {
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL, // must be verified in SendGrid
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
      html: `<strong>Your OTP is ${otp}. It expires in 10 minutes.</strong>`,
    };

    await sgMail.send(msg);

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("SendGrid error:", err.response?.body || err.message);
    return res
      .status(500)
      .json({ success: false, error: "Failed to send OTP email" });
  }
});

// ----------------------
// Start Server
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
);

export default app;
