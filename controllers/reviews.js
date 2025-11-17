const Review = require("../models/review.js");
const Listing = require("../models/listing.js"); 

// Create a new review
module.exports.createReview = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(req.params.id);

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;   
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "Successfully added a new review!");
    res.redirect(`/listings/${id}`);
};

// Delete a review
module.exports.destroyReview = async (req, res) => {
    const {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/listings/${id}`);
};