import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import Document from "./models/Document.js";
import supabase from "./superBaseConfig/supabase.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path";

import { PDFDocument, rgb } from "pdf-lib";
import sharp from "sharp";
import fs from "fs";
import Mailjet from 'node-mailjet';


//import { supabase } from "./supabaseClient"; // your service key init
const router = express.Router();

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

//OTP API keys
const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC,
  apiSecret: process.env.MJ_APIKEY_PRIVATE,
});

// Multer setup for storing files locally in /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });


// Serve uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/documents", express.static(path.join(__dirname, "uploads")));

// Routes
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to Docufy backend!' });
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
      .from(BUCKET_ID) //BUCKET storage name
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
  const BUCKET_ID = "userDocuments";
  try {
    //Fetch the raw document metadata
    console.log("1. Fetching document for code_id:", code_id); //1
    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("code_id", code_id)
      .single();

    if (fetchError || !doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    console.log("Full doc object: ", doc);

    //Download original file from Supabase Storage 
    console.log("2. Downloading file from path:", doc.file_path);
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(BUCKET_ID)
      .download(doc.file_path)

    if (downloadError || !doc) throw downloadError;

    const buffer = Buffer.from(await fileData.arrayBuffer());
    let stampedBuffer;
    let stampedFileName = `${Date.now()}_${doc.file_name}`;

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
      
    } else if (doc.doc_type.startsWith("image/")) {
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

    //Upload stamped file to Supabase storage
    console.log("Uplaoding stamped file", stampedFileName);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_ID)
      .upload(stampedFileName, stampedBuffer, {
         contentType: doc.doc_type,
         upsert: true, //this is to overwrite if the name already exist 
        });

    if (uploadError) throw uploadError;

    //update status in raw documents table
    const {data: updatedDoc, error: updateError} = await supabase
      .from("documents")
      .update({ 
        status: "Approved",
        file_path: stampedFileName,
        verified_at: new Date().toISOString(),
        stamp_text: stampText, 
      })
      .eq("document_id", doc.document_id)
      .select()
      .single();

    if(updateError) throw updateError;

    res.json({ 
      message: "Document stamped and approved!", 
      updatedDoc, 
    });

  } catch (err) {
    console.error("Approve & Stamp error:", err);
    res.status(500).json({ error: "Failed to approve and stamp document" });
    console.error("Detailed error at step:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Failed to approve and stamp document", details: err.message });
  }
});


//Admin rejects document
app.post("/documents/:code_id/reject", async (req, res) => {
  const { code_id } = req.params;
  const { comment } = req.body;
  try {
    //Fetch the raw document metadata
    console.log("1. Fetching document for code_id:", code_id); //1
    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("code_id", code_id)
      .single();

    if (fetchError || !doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    //update status in raw documents table
    const {data: updatedDoc, error: updateError} = await supabase
      .from("documents")
      .update({ 
        status: "Rejected",
      })
      .eq("document_id", doc.document_id)
      .select()
      .single();

    if(updateError) throw updateError;

    res.json({ 
      message: "Document rejected!", 
      updatedDoc, 
    });

  } catch (err) {
    console.error("Rejection error:", err);
    res.status(500).json({ error: "Failed to reject document" });
    console.error("Detailed error at step:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Failed to reject document", details: err.message });
  }
});


//send OTP during Admin registration
app.post("/otp", async (req, res) => {

  const {email} = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); //to create a 6 digit OTP

  try {
    const result = await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: "yussdummy@gmail.com",
              Name: "Test App",
            },
            To: [
              {
                Email: email,
                Name: "New user",
              },
            ],
            Subject: "OTP for verification",
            TextPart: "Your One time Pin",
            HTMLPart: `<h3><strong>${otp}</strong></h3>`,
          },
        ],
      });
    console.log("Message sent:", result.body);
    res.json({success: true, otp});
  } catch (err) {
    console.error("Error sending email:", err);
  }

});


// Start server locally
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}



export default app;
