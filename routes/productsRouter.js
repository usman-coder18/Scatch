const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const isAdmin = require("../middlewares/isAdmin"); 

router.post("/create", upload.single("image"), async function (req, res) {
    try {
        let { name, price, discount, bgcolor, textcolor, panelcolor } = req.body;


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

        req.flash("success", "Product created successfully");
        res.redirect("/owners/admin-dashboard");
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});


router.post("/delete/:productid", isAdmin, async function (req, res) {
  try {
      let product = await productModel.findByIdAndDelete(req.params.productid);
      if (!product) {
          req.flash("error", "Product not found");
          return res.redirect("/owners/admin-dashboard");
      }
      req.flash("success", "Product deleted successfully");
  } catch (err) {
      req.flash("error", "Error deleting product");
  }
  res.redirect("/owners/admin-dashboard");
});
router.post("/delete-all", isAdmin, async function (req, res) {
  try {
      await productModel.deleteMany({}); 
           req.flash("success", "All products deleted successfully");
  } catch (err) {
      req.flash("error", "Error deleting products");
  }
  res.redirect("/owners/admin-dashboard");
});


module.exports = router;
