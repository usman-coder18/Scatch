const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const isAdmin = require("../middlewares/isAdmin"); // Ensure this file exists and exports a middleware

// ✅ Create a New Product
router.post("/create", upload.single("image"), async function (req, res) {
    try {
        // Destructure form data
        let { name, price, discount, bgcolor, textcolor, panelcolor } = req.body;

        // ✅ Validate Required Fields
        if (!name || !price) {
            req.flash("error", "Name and price are required");
            return res.redirect("/owners/admin");
        }

        // ✅ Handle Missing Image
        let image = req.file ? req.file.buffer : null;

        // ✅ Create Product in DB
        let product = await productModel.create({
            name,
            price,
            discount: discount || 0, // Default discount to 0 if not provided
            bgcolor,
            textcolor,
            panelcolor,
            image, // Will be null if no file was uploaded
        });

        req.flash("success", "Product created successfully");
        res.redirect("/owners/admin-dashboard");


    } catch (err) {
        console.error("❌ Error creating product:", err.message);
        res.status(500).send("Error: " + err.message);
    }
});

// ✅ Delete Product Route
router.post("/delete/:productid", isAdmin, async function (req, res) {
  try {
      let product = await productModel.findByIdAndDelete(req.params.productid);
      if (!product) {
          req.flash("error", "Product not found");
          return res.redirect("/owners/admin-dashboard");
      }
      req.flash("success", "Product deleted successfully");
  } catch (err) {
      console.error("❌ Error deleting product:", err.message);
      req.flash("error", "Error deleting product");
  }
  res.redirect("/owners/admin-dashboard");
});
router.post("/delete-all", isAdmin, async function (req, res) {
  try {
      await productModel.deleteMany({}); // Deletes all products
      req.flash("success", "All products deleted successfully");
  } catch (err) {
      console.error("❌ Error deleting all products:", err.message);
      req.flash("error", "Error deleting products");
  }
  res.redirect("/owners/admin-dashboard");
});


module.exports = router;
