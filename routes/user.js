const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const usersController = require("../controllers/users.js");

// Signup routes
router.get("/signup", usersController.renderSignupForm);

// Signup post route
router.post("/signup", wrapAsync(usersController.signup));

// Login routes
router.get("/login", usersController.renderLoginForm);

// Login post route
router.post("/login", saveRedirectUrl, passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), usersController.login);

// Logout route
router.get("/logout", usersController.logout);

module.exports = router;