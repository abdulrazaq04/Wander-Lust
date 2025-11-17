const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const usersController = require("../controllers/users.js");

// User authentication routes => /signup
router.route("/signup").get(usersController.renderSignupForm).post(wrapAsync(usersController.signup));

// Login routes => /login
router.route("/login").get(usersController.renderLoginForm).post(saveRedirectUrl, passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), usersController.login);

// Logout route
router.get("/logout", usersController.logout);

module.exports = router;