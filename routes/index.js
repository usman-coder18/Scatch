const express = require('express');
const isLoggedIn = require('../middlewares/isLoggedIn');
const router = express.Router();
const productModel = require("../models/product-model"); // Import your product model
const userModel = require('../models/user-model');


router.get("/", function (req, res) {
    let error = req.flash('error')|| "";
    res.render("index", { error:[] , loggedin:false });
});

router.get("/shop", isLoggedIn, async function (req, res) {
    try {
        let products = await productModel.find(); // Fetch all products
        let user = await userModel.findOne({ email: req.user.email }).populate("cart"); // Fetch user & cart
        let success = req.flash("success") || []; 
        let error = req.flash("error") || []; 
        
        // 🔥 Fix: Calculate the bill
        let bill = 0;
        let cartCount = 0; // Cart item count

        if (user && user.cart.length > 0) {
            cartCount = user.cart.length; // ✅ Total items in cart
            bill = user.cart.reduce((total, item) => {
                return total + (Number(item.price) + 20 - Number(item.discount));
            }, 0);
        }

        res.render("shop", { products, success, error, user, bill, cartCount }); // ✅ Passing cartCount to EJS
    } catch (err) {
        res.status(500).send("Error fetching products: " + err.message);
    }
});



router.get("/addtocart/:productid", isLoggedIn, async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email });
    if (user) {
      user.cart.push(req.params.productid); // Add product ID to cart
      await user.save(); // Save the updated cart
      req.flash('success', 'Product added to cart successfully!');
      res.redirect("/shop");
    } else {
      res.status(404).send('User not found');
    }
  });
  
  router.get("/cart", isLoggedIn, async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email }).populate("cart");

    if (!user || !user.cart.length) {
        return res.render('cart', { user, bill: 0 });
    }

    // 🔥 Fix: Sum up all items in the cart
    let bill = user.cart.reduce((total, item) => {
        return total + (Number(item.price) + 20 - Number(item.discount));
    }, 0);

    console.log(`Final Bill: ${bill}`);  // Debugging Log

    res.render('cart', { user, bill });
});


  router.post("/remove-from-cart", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Only remove the product ID from the user's cart, NOT from the database
        user.cart = user.cart.filter(item => item.toString() !== req.body.itemId);
        
        await user.save(); // Save the updated cart
        req.flash('success', 'Product removed from cart successfully!');
        res.redirect("/shop"); // Redirect back to cart page
    } catch (err) {
        console.error(err);
        res.status(500).send("Something went wrong!");
    }
});

router.get("/users/logout", isLoggedIn, async function (req, res) {
    res.clearCookie("token"); // Change this to the actual cookie name
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Error logging out");
        }
        res.redirect("/");
    });
});

router.get("/account", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/shop");
        }

        res.render("account", { user });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Internal Server Error");
    }
});
router.get("/owners/admin", isLoggedIn, async function (req, res) {
   
});
router.get("/admin/login", function (req, res) {
    res.render("owner-login");
});

router.get("/admin", async (req, res) => {
    try {
        const products = await Product.find(); // Fetch all products from DB
        res.render("admin-dashboard", { admin: req.user, products }); // Pass products to template
    } catch (err) {
        console.error(err);
        res.redirect("/"); // Redirect to home if there's an error
    }
});


router.post("/delete/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id); // Delete product
        res.redirect("/admin"); // Redirect to admin dashboard
    } catch (err) {
        console.error(err);
        res.redirect("/admin");
    }
});
// module.exports = router;
router.get("/products/create", function (req,res) {
    
    
    let success = req.flash("success") || ""; // Ensure success variable is always defined
    res.render("createproducts",{ success, bgcolor: req.body.bgcolor, panelcolor: req.body.panelcolor, textcolor: req.body.textcolor });
})
router.get("/allproducts/owners/admin-dashboard", function (req,res) {
    res.render("admin-dashboard", { admin: req.owner });

    // res.render("admin-dashboard");
})
router.get("/headercart", isLoggedIn, async (req, res) => {
    try {
      let user = await userModel.findOne({ email: req.user.email }).populate("cart"); // Populate cart items
  
      // Calculate the total bill
      let bill = 0;
      if (user && user.cart.length > 0) {
        bill = user.cart.reduce((total, item) => {
          return total + (Number(item.price) + 20 - Number(item.discount));
        }, 0);
      }
  
      // Render the page and pass the bill
      res.render("headercart", { user, bill }); // Pass `bill` to the view
    } catch (err) {
      console.error("Error fetching user or cart:", err);
      res.status(500).send("Internal Server Error");
    }
  });
  
  

module.exports = router;
