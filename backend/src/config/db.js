const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.COSMOS_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: false, // Cosmos DB does not support retryable writes
    });
    console.log(`✅ Cosmos DB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Cosmos DB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
