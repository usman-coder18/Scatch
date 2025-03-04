require('dotenv').config();
const mongoose = require('mongoose');

const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  process.exit(1);
}

mongoose
  .connect(dbURI, {
  })
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => {
    console.error(" MongoDB Connection Error:", err);
    process.exit(1);
  });

module.exports = mongoose;
