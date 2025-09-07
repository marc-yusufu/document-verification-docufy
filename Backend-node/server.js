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




// Fetch document by id
app.get('/documents/:id', async (req, res) => {
  try {
    const { data: doc, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(404).json({ error: "Document not found" });
    }

    const fileUrl = doc.filepath ? getFileUrl(req, doc.filepath) : null;

    res.json({ ...doc, fileUrl });
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

// Start server locally
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}



export default app;
