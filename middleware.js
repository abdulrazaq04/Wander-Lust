const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

//middleware function to validate listing data using JOI schema
module.exports.validateListing = (req, res, next) => {
    const {error} = listingSchema.validate(req.body);
    if(error) {
        req.session.returnTo = req.originalUrl;   // store the URL user submitted from to redirect back 
        throw new ExpressError(error.details.map(el => el.message).join(","), 400);
    }
    next();
};

//middleware function to validate listing data using JOI schema
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        req.session.returnTo = req.originalUrl;   // store the URL user submitted from to redirect back 
        throw new ExpressError(error.details.map(el => el.message).join(","), 400);
    }
    next();
};

// middleware function to check if the user is logged in
module.exports.isLoggedIn = (req, res, next) => { 
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
};

// middleware function to check and redirect to the prev page
module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// middleware function to check for the listing owner
module.exports.isOwner = async (req,res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You don't have permission to edit or delete");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// middleware function to check for the review author
module.exports.isReviewAuthor = async (req,res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You don't have permission to delete this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};