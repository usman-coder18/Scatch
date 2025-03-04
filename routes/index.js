const express = require('express');
const isLoggedIn = require('../middlewares/isLoggedIn');
const router = express.Router();
const productModel = require("../models/product-model"); 
const userModel = require('../models/user-model');


router.get("/", function (req, res) {
    let error = req.flash('error')|| "";
    res.render("index", { error:[] , loggedin:false });
});

router.get("/shop", isLoggedIn, async function (req, res) {
    try {
        let products = await productModel.find(); 
        let user = await userModel.findOne({ email: req.user.email }).populate("cart"); 
        let success = req.flash("success") || []; 
        let error = req.flash("error") || []; 
        
        let bill = 0;
        let cartCount = 0; 
        if (user && user.cart.length > 0) {
            cartCount = user.cart.length; 
            bill = user.cart.reduce((total, item) => {
                return total + (Number(item.price) + 20 - Number(item.discount));
            }, 0);
        }

        res.render("shop", { products, success, error, user, bill, cartCount }); 
    } catch (err) {
        res.status(500).send("Error fetching products: " + err.message);
    }
});



router.get("/addtocart/:productid", isLoggedIn, async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email });
    if (user) {
      user.cart.push(req.params.productid); 
      await user.save(); 
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

    let bill = user.cart.reduce((total, item) => {
        return total + (Number(item.price) + 20 - Number(item.discount));
    }, 0);

    res.render('cart', { user, bill });
});


  router.post("/remove-from-cart", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).send("User not found");
        }

        user.cart = user.cart.filter(item => item.toString() !== req.body.itemId);
        
        await user.save(); 
        req.flash('success', 'Product removed from cart successfully!');
        res.redirect("/shop"); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Something went wrong!");
    }
});

router.get("/users/logout", isLoggedIn, async function (req, res) {
    res.clearCookie("token"); 
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
        const products = await Product.find(); 
        res.render("admin-dashboard", { admin: req.user, products }); 
    } catch (err) {
        console.error(err);
        res.redirect("/"); 
    }
});


router.post("/delete/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id); 
        res.redirect("/admin"); 
    } catch (err) {
        console.error(err);
        res.redirect("/admin");
    }
});
router.get("/products/create", function (req,res) {
    
    
    let success = req.flash("success") || "";
    res.render("createproducts",{ success, bgcolor: req.body.bgcolor, panelcolor: req.body.panelcolor, textcolor: req.body.textcolor });
})
router.get("/allproducts/owners/admin-dashboard", function (req,res) {
    res.render("admin-dashboard", { admin: req.owner });

    // res.render("admin-dashboard");
})
router.get("/headercart", isLoggedIn, async (req, res) => {
    try {
      let user = await userModel.findOne({ email: req.user.email }).populate("cart"); 
  
      let bill = 0;
      if (user && user.cart.length > 0) {
        bill = user.cart.reduce((total, item) => {
          return total + (Number(item.price) + 20 - Number(item.discount));
        }, 0);
      }
  
      res.render("headercart", { user, bill }); 
    } catch (err) {
      console.error("Error fetching user or cart:", err);
      res.status(500).send("Internal Server Error");
    }
  });
  
  

module.exports = router;
