/*import express from "express";
import multer from "multer";
import { supabase } from "../config/supabaseClient.js";

const router = express.Router();

// Multer in-memory storage (no saving to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload document
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const userId = req.body.user_id; // or from auth middleware
    const { type } = req.body;

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("Documents")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (storageError) throw storageError;

    // Insert record into Postgres
    const { data, error: insertError } = await supabase
      .from("documents")
      .insert([
        {
          user_id: userId,
          type,
          file_url: filePath,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    res.json({ success: true, document: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});*/
