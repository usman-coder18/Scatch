const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-model");

module.exports = async function (req, res, next) {
    if (!req.cookies || !req.cookies.adminToken) {
        req.flash("error", "You need to login first");
        return res.redirect("/");
    }

    try {
        const decoded = jwt.verify(req.cookies.adminToken, process.env.JWT_SECRET);

        let owner = await ownerModel.findById(decoded.id);

        if (!owner) {
            req.flash("error", "Access denied! Admins only.");
            return res.redirect("/owners/login");
        }

        req.owner = owner; 

        next();
    } catch (err) {
        req.flash("error", "Something went wrong");
        res.redirect("/"); 
    }
};
