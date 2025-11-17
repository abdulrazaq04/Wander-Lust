const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { validateListing, isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

// index route and create route  request on => /listings
router.route("/").get(wrapAsync(listingController.index)).post(isLoggedIn, validateListing, wrapAsync(listingController.createListing));

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id").get(wrapAsync(listingController.showListing)).put(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing)).delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

//Edit route
router.get("/:id/edit",isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;