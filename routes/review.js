const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js"); 
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js"); 

//middleware function to validate listing data using JOI schema
const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        req.session.returnTo = req.originalUrl;   // store the URL user submitted from to redirect back 
        throw new ExpressError(error.details.map(el => el.message).join(","), 400);
    }
    next();
};

// post route
router.post("/", validateReview, wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(req.params.id);

    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "Successfully added a new review!");
    res.redirect(`/listings/${id}`);
}));
    
// Delete review route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;