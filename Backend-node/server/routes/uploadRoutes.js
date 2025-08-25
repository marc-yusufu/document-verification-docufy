import Document from '../../models/Document';
//const express = require('express');
//const multer = require('multer');
import express from 'express';
import multer from 'multer';


const router = express.Router();

// Multer setup: store files locally in "uploads" folder
//User uploads document
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Assuming you already connected to MongoDB and have `db`
let db; // set this from your MongoDB connection

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const newDocument = await Document.create({
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      uniqueCode: Math.random().toString(36).substring(2,8).toUpperCase(),
      status: 'pending'
    });
    //await db.collection('documents').insertOne(fileData);
    res.json({ success: true, message: 'File uploaded', document: newDocument });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

//Admin changes the document status
router.put('/document/:id/status', async (req, res) => {
  const {status} = req.body
  if(!['verified', 'rejected'].includes(status)){
    return res.status(400).json({error: 'invalid status'})
  }
  const updatedStatus = await Document.findByIdAndUpdate(req.params.id, {status}, {new: true})
  res.json(updatedStatus)
})

//user fetches document by filename. for filter
router.get('/my-documents', async (req, res) => {
  const { fileName } = req.query
  const query = fileName ? { fileName } : {}
  const docs = await Document.find(query)
  res.json(docs)
})

export default router;

