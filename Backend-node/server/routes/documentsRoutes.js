//server/routes/documentRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { MongoClient } = require('mongodb');

const router = express.Router();

router.get('/documents', async (req, res) => {
  try {
    const docs = await db.collection('documents').find().toArray();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
