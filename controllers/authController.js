const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
  try {
    let { fullname, email, password } = req.body;
    let user = await userModel.findOne({ email: email });
    if (user) return res.status(400).send("User already exists");

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let newUser = await userModel.create({
      fullname,
      email,
      password: hash,
    });

    let token = generateToken(newUser);
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.send("User created successfully");
  } catch (err) {
    console.error("Error during registration:", err.message);
    res.status(500).send("Something went wrong");
  }
};

module.exports.loginUser = async function (req, res) {
  try {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email });

    if (!user) {
      req.flash("error", "Email or password is incorrect");
      return res.redirect("/");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      let token = generateToken(user);
      res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      console.log("Login Successful! Token:", token);
      return res.redirect("/shop");
    } else {
      req.flash("error", "Email or password is incorrect");
      return res.redirect("/");
    }
  } catch (err) {
    console.error("Login error:", err.message);
    req.flash("error", "Something went wrong.");
    res.redirect("/");
  }
};

module.exports.logout = function (req, res) {
  res.clearCookie("token");
  res.redirect("/");
};
