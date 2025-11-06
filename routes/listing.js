const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js"); 
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");

//middleware function to validate listing data using JOI schema
const validateListing = (req, res, next) => {
    const {error} = listingSchema.validate(req.body);
    if(error) {
        req.session.returnTo = req.originalUrl;   // store the URL user submitted from to redirect back 
        throw new ExpressError(error.details.map(el => el.message).join(","), 400);
    }
    next();
};

//index route
router.get("/", async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
});

//new route
router.get("/new", async (req, res) => {
    res.render("listings/new.ejs")
});

//show route
router.get("/:id", async (req, res) => {
    let {id} = req.params; 
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
});

//Create Route
router.post("/", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//Edit route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params; 
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//update route // validateListing is a middleware function is used here to validate the updated data 
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    let {id} = req.params;
        if (req.body.listing.image && !req.body.listing.image.url) {
        delete req.body.listing.image.url;
    }
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//delete route
router.delete("/:id", wrapAsync(async (req, res, next) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router;