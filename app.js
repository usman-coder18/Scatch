require('dotenv').config();
console.log("🚀 MONGODB_URI:", process.env.MONGODB_URI);

const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const flash = require("express-flash");
const dotenv = require("dotenv");

// Load Environment Variables
dotenv.config();

// Database Connection
require("./config/mongoose-connection");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Express Session Middleware (Fix: Move this ABOVE flash)
const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI, // Use your DB connection
      collectionName: 'sessions',
    }),
    cookie: { secure: false }, // Change to `true` if using HTTPS
  })
);

// Flash Messages (Fix: Move this BELOW expressSession)
app.use(flash());

// Set View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Import Routes
const ownersRouter = require("./routes/ownersRouter");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");
const indexRouter = require("./routes/index");

// Use Routes
app.use("/", indexRouter);
app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
