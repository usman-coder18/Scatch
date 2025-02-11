const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ownerSchema = new mongoose.Schema({
  fullname: {
    type: String,
    trim: true,
    minlength: 3,
    required: true,
  },
  role: {
    type: String,
    default: "admin", },// ✅ Ensure role is set to "admin"

  email: {
    type: String,
    required: true,
    unique: true, // Ensure only one admin exists
  },
  password: {
    type: String,
    required: true,
  },
  products: {
    type: Array,
    default: [],
  },
  picture: String,
  gstin: String,
});

// Hash password before saving
ownerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Owner = mongoose.model("Owner", ownerSchema);
module.exports = Owner;
