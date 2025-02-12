const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const isAdmin = require("../middlewares/isAdmin"); // Ensure this file exists and exports a middleware

// ✅ Create a New Product
router.post("/create", upload.single("image"), async function (req, res) {
    try {
        let { name, price, discount, bgcolor, textcolor, panelcolor } = req.body;

        // Debugging logs
        console.log("Received Data:", req.body); // Check if colors are coming from form

        if (!name || !price) {
            req.flash("error", "Name and price are required");
            return res.redirect("/owners/admin");
        }

        let image = req.file ? req.file.buffer : null;

        let product = await productModel.create({
            name,
            price,
            discount: discount || 0,
            bgcolor,
            textcolor,
            panelcolor,
            image,
        });

        console.log("Saved Product:", product); // Check if colors are saved in DB
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
