const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owner-model"); 
const productModel = require("../models/product-model"); 
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken"); 
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser"); 
const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdmin = require("../middlewares/isAdmin");

dotenv.config(); 
router.use(cookieParser()); 

const verifyAdmin = (req, res, next) => {
  const token = req.cookies.adminToken;
  if (!token) return res.redirect("/owners/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded; 
    next();
  } catch (error) {
    res.redirect("/owners/login");
  }
};

router.use("/admin-dashboard", verifyAdmin);

router.post("/login", async function (req, res) {
  const { email, password } = req.body;

  try {
    const owner = await ownerModel.findOne({ email });

    if (!owner) {
      req.flash("error", "Admin not found");
      return res.redirect("/owners/login");
    }


    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/owners/login");
    }


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

    req.flash("success", "Login successful");
    res.redirect("/owners/admin-dashboard");

  } catch (error) {
    req.flash("error", "Something went wrong");
    res.redirect("/owners/login");
  }
});

router.get("/login", (req, res) => {
  res.render("owner-login", { messages: req.flash() }); 
});

router.get("/admin-dashboard", isAdmin, async function (req, res) {
  try {
    const products = await productModel.find(); 
const {bgColor,
  panelColor,
  textColor,} = req.body

    res.render("admin-dashboard", {
      admin: req.user,
      products, 
      bgColor,
      panelColor,
      textColor,
    });
  } catch (error) {
    res.render("admin-dashboard", {
      admin: req.user,
      products: [],
    });
  }
});


router.get("/users/logout", (req, res) => {
  res.clearCookie("adminToken");  
  req.flash("success", "Logged out successfully");
  res.redirect("/owners/login");
});

router.post("/products/delete/:id", async function (req, res) {
  try {
    const deletedProduct = await productModel.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      req.flash("error", "Product not found");
      return res.redirect("/owners/admin-dashboard");
    }

    req.flash("success", "Product deleted successfully");
  } catch (error) {
    req.flash("error", "Error deleting product");
  }

  res.redirect("/owners/admin-dashboard");
});
module.exports = router; 
