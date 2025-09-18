import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import Document from "./models/Document.js";
import supabase from "./superBaseConfig/supabase.js";
import mongoose from "mongoose";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path";

import { PDFDocument, rgb } from "pdf-lib";
import sharp from "sharp";
import fs from "fs";

//import { supabase } from "./supabaseClient"; // your service key init
const router = express.Router();

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Multer setup for storing files locally in /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// MongoDB connection with mongoose
mongoose.connect(process.env.MONGO_URI, {
  dbName: process.env.MONGO_DB_NAME || 'eDocufy_database'
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error: ', err))

// Serve uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/documents", express.static(path.join(__dirname, "uploads")));

// Routes
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to Docufy backend!' });
});

app.get("/api/data", async (req, res) => {
  const data = await Document.find().toArray();
  res.json(data);
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server running' });
});

// Helper to build full file URL
const getFileUrl = (req, filePath) => {
  // Strip out "uploads/" from stored path
  const cleanPath = filePath.replace(/^uploads[\\/]/, "");
  return `${req.protocol}://${req.get("host")}/documents/${cleanPath}`;
};

// Upload route
app.post("/upload", upload.single("file"), async (req, res) => {

  //MongoDB
  try {
    const newDocument = await Document.create({
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      idCode: Math.random().toString(36).substring(2,8).toUpperCase(),
      status: 'pending',
      uploadedAt: new Date(),
    });
    
    const fileUrl = getFileUrl(req, newDocument.filePath); //create file url for the frontend

    console.log("Uploaded file:", req.file);
    res.json({ success: true, message: 'File uploaded', document: {...newDocument.toObject(), fileUrl} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }

});

// // Fetch alll documents 
// app.get('/documents', async (req, res) => {
//   try{
//     const docs = await Document.find().sort({uploadedAt: -1});

//     const docsWithUrls = docs.map(doc => ({
//       ...doc.toObject(),
//       fileUrl: getFileUrl(req, doc.filePath)
//     }));

//     res.json(docsWithUrls);
//   }catch(err){
//     res.status(500).json({ success: false, error: err.message });
//   }
// })



// Fetch documents with optional status filtering
app.get('/documents', async (req, res) => {

  /* supabase */
  try {
    let query = supabase.from("documents").select("*").order("submitted_at", {ascending: false});


    // Example: /documents?status=approved,rejected
    if (req.query.status) {
      const statuses = req.query.status.split(",");
      query = query.in("status", statuses)
    }

    const {data: docs, error} = await query;
    console.log("Docs from Supabase:", docs);
    console.log("Supabase error:", error);

    if(error) throw error;

    const docsWithUrls = docs.map(doc => ({
      ...doc,
      fileUrl: getFileUrl(req, doc.filePath || "")
    }));

    res.json(docsWithUrls);
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});




// Fetch document by code_id
app.get('/documents/:code_id', async (req, res) => {

  const codeIdParams = req.params.code_id;
  const BUCKET_ID = "userDocuments";

  console.log("Backend received file_url:", codeIdParams);
  try {
    const { data: doc, error } = await supabase
      .from("documents")
      .select("*")
      .eq("code_id", codeIdParams)
      .single();
    
    console.log("Query result: " , {data: doc, error: error})

    if (error || !doc) {
      console.error("Supabase error:", error);
      return res.status(404).json({ error: "Document not found" });
    }

    // const fileUrl = doc.filepath ? getFileUrl(req, doc.filepath) : null;

    // res.json({ ...doc, fileUrl });

    const { data: signed } = await supabase.storage
      .from("userDocuments") //BUCKET storage name
      .createSignedUrl(doc.file_path, 60 * 60 * 24 * 7); // 7 days
    
      // Attach signedUrl so frontend can render
    const responseDoc = {
      ...doc,
      url: signed?.signedUrl ?? null,
    };


    res.json(responseDoc);

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});



//Admin Update status of documents
app.put('/documents/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data: updatedDoc, error } = await supabase
      .from("documents")
      .update({ status })
      .eq("document_id", req.params.id)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(updatedDoc);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
})




//Admin puts approval stamp on document by pressing approve button
app.post("/documents/:code_id/approve", async (req, res) => {
  const { code_id } = req.params;
  const stampText = req.body.stampText || "APPROVED"; // or dynamic code
  try {
    //Fetch the raw document metadata
    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("code_id", code_id)
      .single();

    if (fetchError || !doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    //Download raw file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("userDocuments")
      .download(doc.file_path);

    if (downloadError || !fileData) throw downloadError;

    const buffer = Buffer.from(await fileData.arrayBuffer());
    let stampedBuffer;
    let stampedFileName;

    //Apply stamp based on file type
    if (doc.doc_type === "application/pdf") {
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        page.drawText(stampText, {
          x: 50,
          y: 50,
          size: 40,
          color: rgb(1, 0, 0),
          opacity: 0.5,
        });
      });

      stampedBuffer = Buffer.from(await pdfDoc.save());
      stampedFileName = `${Date.now()}_${doc.file_name}`;
    } else if (doc.mime_type.startsWith("image/")) {
      const svgWatermark = Buffer.from(
        `<svg width="500" height="500">
          <text x="20" y="50" font-size="30" fill="red" opacity="0.5">${stampText}</text>
        </svg>`
      );
      stampedBuffer = await sharp(buffer)
        .composite([{ input: svgWatermark, gravity: "southeast" }])
        .toBuffer();
      stampedFileName = `${Date.now()}_${doc.file_name}`;
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // 4️⃣ Upload stamped file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("userDocuments")
      .upload(stampedFileName, stampedBuffer, { contentType: doc.mime_type });

    if (uploadError) throw uploadError;

    // 5️⃣ Insert stamped document metadata into `approved_documents`
    const { data: approvedDoc, error: insertError } = await supabase
      .from("approved_documents")
      .insert([
        {
          original_doc_id: doc.document_id,
          file_name: doc.file_name,
          file_path: stampedFileName,
          mime_type: doc.mime_type,
          doc_type: doc.doc_type,
          status: "Approved",
          approved_at: new Date().toISOString(),
          stamp_text: stampText,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    //update status in raw documents table
    await supabase
      .from("documents")
      .update({ status: "Approved" })
      .eq("document_id", doc.document_id);

    res.json({ message: "Document stamped and approved!", approvedDoc });
  } catch (err) {
    console.error("Approve & Stamp error:", err);
    res.status(500).json({ error: "Failed to approve and stamp document" });
  }
});





// Start server locally
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}



export default app;
