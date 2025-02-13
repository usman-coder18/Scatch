require('dotenv').config();
const mongoose = require('mongoose');

const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error("❌ MONGODB_URI is not defined! Check Railway environment variables.");
  process.exit(1);
}

mongoose
  .connect(dbURI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

module.exports = mongoose;
