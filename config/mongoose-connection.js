require('dotenv').config();
const config = require('config');
const mongoose = require('mongoose');
const debug = require('debug')("development:mongoose");

const MONGODB_URI = config.get("MONGODB_URI");

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Successfully connected to MongoDB Atlas");
  debug("Connected to MongoDB Atlas");
})
.catch((err) => {
  console.error("❌ MongoDB Atlas Connection Failed:", err);
  debug("MongoDB Atlas Connection Error:", err);
  process.exit(1);
});

module.exports = mongoose.connection;
