//to create a new collection with its attributes

import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    fileName: String,
    filePath: String,
    fileType: String,
    idCode: String,
    status: {type: String, enum: ['pending', 'verify', 'rejected'], default: 'pending'},
    uploadedAt: {type: Date, default: Date.now}
});

const Document = mongoose.model('Document', documentSchema);
export default Document;