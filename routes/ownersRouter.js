const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owner-model"); // Owner Model
const productModel = require("../models/product-model"); // Product Model
const bcrypt = require("bcryptjs"); // For Password Hashing
const jwt = require("jsonwebtoken"); // For Token Generation
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser"); // Required for reading cookies
const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdmin = require("../middlewares/isAdmin");

dotenv.config(); // Load .env Variables
router.use(cookieParser()); // Middleware to use cookies

// ✅ Middleware to Verify Admin Login
const verifyAdmin = (req, res, next) => {
  const token = req.cookies.adminToken; // Get token from cookie
  if (!token) return res.redirect("/owners/login"); // Redirect if not logged in

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    console.error("❌ Invalid Token:", error);
    res.redirect("/owners/login");
  }
};

// ✅ Apply Middleware to Protect Routes
router.use("/admin-dashboard", verifyAdmin);

// ✅ Admin Login Route
router.post("/login", async function (req, res) {
  const { email, password } = req.body;

  try {
    console.log("🔍 Searching for email:", email);
    const owner = await ownerModel.findOne({ email });

    if (!owner) {
      console.log("❌ Admin not found in database!");
      req.flash("error", "Admin not found");
      return res.redirect("/owners/login");
    }

    console.log("✅ Admin found:", owner);

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      console.log("❌ Password mismatch!");
      req.flash("error", "Invalid credentials");
      return res.redirect("/owners/login");
    }

    console.log("✅ Password matched!");

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: owner._id, fullname: owner.fullname },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("✅ Login successful!");
    req.flash("success", "Login successful");
    res.redirect("/owners/admin-dashboard");

  } catch (error) {
    console.error("❌ Error during login:", error);
    req.flash("error", "Something went wrong");
    res.redirect("/owners/login");
  }
});

// ✅ Show Login Page
router.get("/login", (req, res) => {
  res.render("owner-login", { messages: req.flash() }); // Pass messages
});

// ✅ Admin Dashboard Route (Fetch & Show Products)
router.get("/admin-dashboard", isAdmin, async function (req, res) {
  try {
    const products = await productModel.find(); // ✅ Fetch all products
const {bgColor,
  panelColor,
  textColor,} = req.body
    console.log("Fetched Products:", products); // ✅ Debugging

    res.render("admin-dashboard", {
      admin: req.user,
      products, // ✅ Yehi object pass karna hai
      bgColor,
      panelColor,
      textColor,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.render("admin-dashboard", {
      admin: req.user,
      products: [],
    });
  }
});


// ✅ Logout Route
router.get("/users/logout", (req, res) => {
  res.clearCookie("adminToken"); // Remove JWT token
  req.flash("success", "Logged out successfully");
  res.redirect("/owners/login");
});

// ✅ Delete Product Route
router.post("/products/delete/:id", async function (req, res) {
  try {
    const deletedProduct = await productModel.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      req.flash("error", "Product not found");
      return res.redirect("/owners/admin-dashboard");
    }

    req.flash("success", "Product deleted successfully");
  } catch (error) {
    console.error("Error deleting product:", error);
    req.flash("error", "Error deleting product");
  }

  res.redirect("/owners/admin-dashboard");
});
// router.get("/account",isLoggedIn, (req, res) => {
//   console.log("router hit");
  
//   res.render("account"); // Pass messages
// });

module.exports = router; // ✅ Export Router
