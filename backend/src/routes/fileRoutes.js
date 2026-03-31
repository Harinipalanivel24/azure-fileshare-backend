const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadFile,
  getMyFiles,
  searchFiles,
  getFileById,
  downloadFile,
  deleteFile,
  generateShareLink,
  getSharedFile,
  downloadSharedFile,
} = require('../controllers/fileController');

// --- Public routes (shared file access) ---
router.get('/shared/:token', getSharedFile);
router.get('/shared/:token/download', downloadSharedFile);

// --- Protected routes ---
router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.get('/', authMiddleware, getMyFiles);
router.get('/search', authMiddleware, searchFiles);
router.get('/:id', authMiddleware, getFileById);
router.get('/:id/download', authMiddleware, downloadFile);
router.delete('/:id', authMiddleware, deleteFile);
router.post('/:id/share', authMiddleware, generateShareLink);

module.exports = router;
