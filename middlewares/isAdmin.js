const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-model");

module.exports = async function (req, res, next) {
    // Check if the admin token exists
    if (!req.cookies || !req.cookies.adminToken) {
        req.flash("error", "You need to login first");
        return res.redirect("/"); // Redirect to home or login page
    }

    try {
        // Decode the admin token
        const decoded = jwt.verify(req.cookies.adminToken, process.env.JWT_SECRET);
        // console.log("✅ Decoded Token in Middleware:", decoded);

        // Fetch the admin (owner) using the decoded ID
        let owner = await ownerModel.findById(decoded.id);
        // console.log("✅ Owner Found in Middleware:", owner);

        // If no owner is found, deny access
        if (!owner) {
            req.flash("error", "Access denied! Admins only.");
            return res.redirect("/owners/login"); // Redirect to login page
        }

        // Attach the owner (admin) data to the request
        req.owner = owner; 
        // console.log("✅ req.owner Set:", req.owner);

        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        // console.log("❌ Error in Admin Middleware:", err);
        req.flash("error", "Something went wrong");
        res.redirect("/"); // Redirect to home or an error page
    }
};
