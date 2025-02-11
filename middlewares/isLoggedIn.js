const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-model");
const userModel = require("../models/user-model");

module.exports = async function (req, res, next) {
    console.log("🍪 Raw Cookies (req.headers.cookie):", req.headers.cookie);
    console.log("🍪 Parsed Cookies (req.cookies):", req.cookies);

    // Check for cookies
    if (!req.cookies || (!req.cookies.token && !req.cookies.adminToken && !req.cookies.userToken)) {
        console.log("❌ No token found in cookies!");
        req.flash("error", "You need to login first");
        return res.redirect("/");  // Or wherever you want to redirect
    }

    const token = req.cookies.token || req.cookies.adminToken || req.cookies.userToken;
    console.log("🟢 Extracted Token:", token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);  // Ensure correct key is used

        console.log("✅ Decoded Token:", decoded);

        let user;
        if (decoded.role === "admin") {
            user = await ownerModel.findById(decoded.id).select("-password");
            console.log("👑 Admin User Found:", user);
        } else {
            user = await userModel.findById(decoded.id).select("-password");
            console.log("👤 Regular User Found:", user);
        }

        if (!user) {
            console.log("❌ User/Admin not found in database!");
            res.clearCookie("token");
            res.clearCookie("adminToken");
            res.clearCookie("userToken");
            req.flash("error", "User not found");
            return res.redirect("/");
        }

        req.user = user;  // Attach user to request
        next();
    } catch (err) {
        console.error("❌ JWT Verification Error:", err);
        res.clearCookie("token");
        res.clearCookie("adminToken");
        res.clearCookie("userToken");
        req.flash("error", "Invalid session, please log in again");
        return res.redirect("/");  // Or wherever you want to redirect
    }
};
