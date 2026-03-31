const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const File = require('../models/File');
const { getContainerClient } = require('../config/azureStorage');

// ─── helper: upload buffer to Azure Blob ──────────────────────────
const uploadToBlob = async (blobName, buffer, mimeType) => {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimeType },
  });
  return blockBlobClient.url;
};

// ─── helper: delete blob ──────────────────────────────────────────
const deleteBlob = async (blobName) => {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
};

// ─── helper: call Azure Function to track downloads ───────────────
const callDownloadTracker = async (fileId) => {
  const baseUrl = process.env.AZURE_FUNCTION_BASE_URL;
  if (!baseUrl || baseUrl === 'YOUR_VALUE_HERE') return;
  try {
    await axios.post(`${baseUrl}/api/trackDownload`, { fileId });
  } catch (err) {
    console.error('Download tracker function call failed:', err.message);
  }
};

// ─── POST /api/files/upload ───────────────────────────────────────
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided.' });
    }

    const { originalname, mimetype, buffer, size } = req.file;
    const blobName = `${req.user.id}/${uuidv4()}-${originalname}`;

    const blobUrl = await uploadToBlob(blobName, buffer, mimetype);

    const file = await File.create({
      userId: req.user.id,
      originalName: originalname,
      blobName,
      blobUrl,
      mimeType: mimetype,
      size,
    });

    res.status(201).json({ message: 'File uploaded successfully.', file });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed.' });
  }
};

// ─── GET /api/files ───────────────────────────────────────────────
exports.getMyFiles = async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ files });
  } catch (err) {
    console.error('GetMyFiles error:', err);
    res.status(500).json({ message: 'Failed to fetch files.' });
  }
};

// ─── GET /api/files/search?q=keyword ─────────────────────────────
exports.searchFiles = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ files: [] });

    const files = await File.find({
      userId: req.user.id,
      originalName: { $regex: q, $options: 'i' },
    }).sort({ createdAt: -1 });

    res.json({ files });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Search failed.' });
  }
};

// ─── GET /api/files/:id ──────────────────────────────────────────
exports.getFileById = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found.' });
    res.json({ file });
  } catch (err) {
    console.error('GetFileById error:', err);
    res.status(500).json({ message: 'Failed to fetch file.' });
  }
};

// ─── GET /api/files/:id/download ─────────────────────────────────
exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found.' });

    // Track download via Azure Function
    await callDownloadTracker(file._id.toString());

    // Increment local count as well
    file.downloadCount += 1;
    await file.save();

    const containerClient = getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(file.blobName);
    const downloadResponse = await blockBlobClient.download(0);

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    downloadResponse.readableStreamBody.pipe(res);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ message: 'Download failed.' });
  }
};

// ─── DELETE /api/files/:id ────────────────────────────────────────
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found.' });

    await deleteBlob(file.blobName);
    await File.deleteOne({ _id: file._id });

    res.json({ message: 'File deleted successfully.' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Delete failed.' });
  }
};

// ─── POST /api/files/:id/share ────────────────────────────────────
exports.generateShareLink = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found.' });

    if (!file.shareToken) {
      file.shareToken = uuidv4();
      await file.save();
    }

    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${file.shareToken}`;
    res.json({ shareUrl, shareToken: file.shareToken });
  } catch (err) {
    console.error('Share error:', err);
    res.status(500).json({ message: 'Failed to generate share link.' });
  }
};

// ─── GET /api/files/shared/:token (PUBLIC) ────────────────────────
exports.getSharedFile = async (req, res) => {
  try {
    const file = await File.findOne({ shareToken: req.params.token });
    if (!file) return res.status(404).json({ message: 'Shared file not found.' });
    res.json({ file });
  } catch (err) {
    console.error('GetSharedFile error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET /api/files/shared/:token/download (PUBLIC) ───────────────
exports.downloadSharedFile = async (req, res) => {
  try {
    const file = await File.findOne({ shareToken: req.params.token });
    if (!file) return res.status(404).json({ message: 'Shared file not found.' });

    // Track download via Azure Function
    await callDownloadTracker(file._id.toString());

    file.downloadCount += 1;
    await file.save();

    const containerClient = getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(file.blobName);
    const downloadResponse = await blockBlobClient.download(0);

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    downloadResponse.readableStreamBody.pipe(res);
  } catch (err) {
    console.error('Shared download error:', err);
    res.status(500).json({ message: 'Download failed.' });
  }
};
