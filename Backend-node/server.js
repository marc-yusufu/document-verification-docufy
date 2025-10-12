// server.js
import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import supabase from "./superBaseConfig/supabase.js";
import { PDFDocument, rgb } from "pdf-lib";
import sharp from "sharp";
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Register fonts
const fontsDir = path.join(process.cwd(), "assets/fonts");
try {
  registerFont(path.join(fontsDir, "OpenSans-Regular.ttf"), { family: "OpenSans" });
  registerFont(path.join(fontsDir, "Pacifico-Regular.ttf"), { family: "Pacifico" });
} catch (e) {
  console.warn("Fonts not found, using system defaults");
}

// Helper: generate Supabase signed URL
const getSignedUrl = async (bucket, filePath) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 60 * 60 * 24 * 7);
  if (error) throw error;
  return data.signedUrl;
};

// Helper: generate short unique ID
const makeDocId = () => Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);

// Helper: wrap text for Canvas
function wrapTextCentered(ctx, text, xCenter, yStart, maxWidth, lineHeight, font) {
  ctx.font = font;
  ctx.textAlign = "center";
  const words = text.split(" ");
  let line = "";
  let y = yStart;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), xCenter, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line.trim(), xCenter, y);
  return y + lineHeight;
}

// Health check
app.get("/api/health", (req, res) => res.json({ success: true, message: "Server running" }));

// Upload document
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    const BUCKET_ID = "userDocuments";
    const fileName = `${Date.now()}_${req.file.originalname}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_ID)
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: true });
    if (uploadError) throw uploadError;

    const code_id = makeDocId();
    const { data: doc, error: insertError } = await supabase
      .from("documents")
      .insert([{
        file_name: req.file.originalname,
        file_path: fileName,
        doc_type: req.file.mimetype,
        code_id,
        status: "pending",
        submitted_at: new Date()
      }])
      .select()
      .single();
    if (insertError) throw insertError;

    res.json({ success: true, document: doc });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all documents
app.get("/documents", async (req, res) => {
  try {
    let query = supabase.from("documents").select("*").order("submitted_at", { ascending: false });
    if (req.query.status) query = query.in("status", req.query.status.split(","));
    const { data: docs, error } = await query;
    if (error) throw error;

    const docsWithUrls = await Promise.all(
      docs.map(async doc => {
        const url = await getSignedUrl("userDocuments", doc.file_path);
        return { ...doc, url };
      })
    );
    res.json(docsWithUrls);
  } catch (err) {
    console.error("Fetch documents error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get document by code_id
app.get("/documents/:code_id", async (req, res) => {
  try {
    const { code_id } = req.params;
    const { data: doc, error } = await supabase
      .from("documents")
      .select("*")
      .eq("code_id", code_id)
      .single();
    if (error || !doc) return res.status(404).json({ error: "Document not found" });

    const url = await getSignedUrl("userDocuments", doc.file_path);
    res.json({ ...doc, url });
  } catch (err) {
    console.error("Fetch document error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Approve document & apply transparent stamp
app.post("/documents/:code_id/approve", async (req, res) => {
  try {
    const { code_id } = req.params;
    const stampText = req.body.stampText || "APPROVED";
    const verifier = req.body.verifier || "John Smith";
    const designation = req.body.designation || "Chartered Accountant (SA)";
    const designationNumber = req.body.designationNumber || "00112233";
    const dateText = req.body.date || new Date().toLocaleDateString();
    const address = req.body.address || "1st Floor, 123 Main Street, Rosebank, Johannesburg";
    const BUCKET_ID = "userDocuments";

    // Fetch document
    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("code_id", code_id)
      .single();
    if (fetchError || !doc) return res.status(404).json({ error: "Document not found" });

    const { data: fileData, error: downloadError } = await supabase.storage.from(BUCKET_ID).download(doc.file_path);
    if (downloadError || !fileData) throw downloadError;
    const buffer = Buffer.from(await fileData.arrayBuffer());
    let stampedBuffer;
    const stampedFileName = `${Date.now()}_${doc.file_name}`;

    // Apply stamp
    if (doc.doc_type === "application/pdf") {
      const pdfDoc = await PDFDocument.load(buffer);
      pdfDoc.getPages().forEach(page => {
        page.drawText(stampText, {
          x: page.getWidth() - 200,
          y: 50,
          size: 36,
          color: rgb(1, 0, 0),
          opacity: 0.5
        });
      });
      stampedBuffer = Buffer.from(await pdfDoc.save());
    } else if (doc.doc_type.startsWith("image/")) {
      const width = 600;
      const height = 200;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255,0,0,0.5)";
      ctx.font = "bold 48px OpenSans";
      ctx.textAlign = "center";
      ctx.fillText(stampText, width / 2, height / 2);
      const stampBuffer = canvas.toBuffer("png");
      stampedBuffer = await sharp(buffer)
        .composite([{ input: stampBuffer, gravity: "southeast" }])
        .toBuffer();
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Upload stamped file
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_ID)
      .upload(stampedFileName, stampedBuffer, { contentType: doc.doc_type, upsert: true });
    if (uploadError) throw uploadError;

    // Update metadata in Supabase
    const { data: updatedDoc, error: updateError } = await supabase
      .from("documents")
      .update({
        status: "approved",
        file_path: stampedFileName,
        verified_at: new Date().toISOString(),
        stamp_text: stampText,
        verifier,
        designation,
        designationNumber,
        verification_date: dateText,
        address
      })
      .eq("document_id", doc.document_id)
      .select()
      .single();
    if (updateError) throw updateError;

    const signedUrl = await getSignedUrl(BUCKET_ID, updatedDoc.file_path);
    res.json({ message: "Document approved and stamped!", updatedDoc: { ...updatedDoc, signed_url: signedUrl } });
  } catch (err) {
    console.error("Approve & stamp error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reject document
app.post("/documents/:code_id/reject", async (req, res) => {
  try {
    const { code_id } = req.params;
    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("code_id", code_id)
      .single();
    if (fetchError || !doc) return res.status(404).json({ error: "Document not found" });

    const { data: updatedDoc, error: updateError } = await supabase
      .from("documents")
      .update({ status: "rejected" })
      .eq("document_id", doc.document_id)
      .select()
      .single();
    if (updateError) throw updateError;

    const signedUrl = await getSignedUrl("userDocuments", updatedDoc.file_path);
    res.json({ message: "Document rejected!", updatedDoc: { ...updatedDoc, signed_url: signedUrl } });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export default app;
