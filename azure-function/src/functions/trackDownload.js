const { app } = require('@azure/functions');
const mongoose = require('mongoose');

// ─── Mongoose connection (reuses across warm invocations) ─────────
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  const uri = process.env.COSMOS_MONGODB_URI;
  if (!uri) throw new Error('COSMOS_MONGODB_URI not set');
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: false,
  });
  isConnected = true;
};

// ─── Minimal File schema (mirrors backend model) ─────────────────
const fileSchema = new mongoose.Schema(
  {
    downloadCount: { type: Number, default: 0 },
  },
  { strict: false }
);

const File = mongoose.models.File || mongoose.model('File', fileSchema);

// ─── HTTP Trigger: POST /api/trackDownload ────────────────────────
app.http('trackDownload', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('trackDownload function invoked');

    try {
      const body = await request.json();
      const { fileId } = body;

      if (!fileId) {
        return { status: 400, jsonBody: { message: 'fileId is required.' } };
      }

      await connectDB();

      const file = await File.findById(fileId);
      if (!file) {
        return { status: 404, jsonBody: { message: 'File not found.' } };
      }

      file.downloadCount = (file.downloadCount || 0) + 1;
      await file.save();

      context.log(`Download count for ${fileId} updated to ${file.downloadCount}`);

      return {
        status: 200,
        jsonBody: {
          message: 'Download tracked.',
          fileId,
          downloadCount: file.downloadCount,
        },
      };
    } catch (err) {
      context.log('Error in trackDownload:', err.message);
      return { status: 500, jsonBody: { message: 'Internal error.' } };
    }
  },
});
