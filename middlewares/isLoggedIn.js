const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-model");
const userModel = require("../models/user-model");

module.exports = async function (req, res, next) {

    if (!req.cookies || (!req.cookies.token && !req.cookies.adminToken && !req.cookies.userToken)) {
        req.flash("error", "You need to login first");
        return res.redirect("/");  
    }

    const token = req.cookies.token || req.cookies.adminToken || req.cookies.userToken;

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);  


        let user;
        if (decoded.role === "admin") {
            user = await ownerModel.findById(decoded.id).select("-password");
        } else {
            user = await userModel.findById(decoded.id).select("-password");
            console.log("👤 Regular User Found:", user);
        }

        if (!user) {
            res.clearCookie("token");
            res.clearCookie("adminToken");
            res.clearCookie("userToken");
            req.flash("error", "User not found");
            return res.redirect("/");
        }

        req.user = user; 
        next();
    } catch (err) {
        res.clearCookie("token");
        res.clearCookie("adminToken");
        res.clearCookie("userToken");
        req.flash("error", "Invalid session, please log in again");
        return res.redirect("/");
    }
};
