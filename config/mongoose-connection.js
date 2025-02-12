require('dotenv').config();
const config = require('config');
const mongoose = require('mongoose');
const debug = require('debug')("development:mongoose");

// const config = require("config");

// const mongoose = require("mongoose");

// Check if MONGODB_URI is set
const dbURI = process.env.MONGODB_URI || config.get("MONGODB_URI");

if (!dbURI) {
  console.error("❌ MONGODB_URI is not defined! Check Railway environment variables.");
  process.exit(1);
}

mongoose
  .connect(dbURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

module.exports = mongoose;
