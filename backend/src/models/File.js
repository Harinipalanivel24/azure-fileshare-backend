const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    blobName: { type: String, required: true },          // name in Azure Blob Storage
    blobUrl: { type: String, required: true },            // full blob URL
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },               // bytes
    shareToken: { type: String, default: null },          // public share token
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
fileSchema.index({ originalName: 'text' });

module.exports = mongoose.model('File', fileSchema);
