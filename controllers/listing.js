const Listing = require("../models/listing");

// Index Route - Display all listings
module.exports.index = async(req, res) => {
    const allListings = await Listing.find({}).populate("reviews");
    res.render("listings/index.ejs", {allListings});
};

// Render New Listing Form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Show Route - Display a specific listing
module.exports.showListing = async (req, res) => {
    let {id} = req.params; 
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" },}).populate("owner");
    if(!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", {listing});
};

// Create Route - Create a new listing
module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
};

// Render Edit Listing Form
module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params; 
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    let originalListingImageUrl = listing.image.url;
    originalListingImageUrl = originalListingImageUrl.replace('/upload', '/upload/w_250');
    res.render("listings/edit.ejs", {listing, originalListingImageUrl});
};

// Update Route - Update a specific listing
module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== 'undefined') {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
    }

    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
};

// Delete Route - Delete a specific listing
module.exports.deleteListing = async (req, res) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
};