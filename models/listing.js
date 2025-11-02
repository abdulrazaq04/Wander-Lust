const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ListingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: "https://plus.unsplash.com/premium_photo-1760631324997-394b4fef96c9?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=2070"
        }
    },
    price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
    },
    location: String, 
    country: String,
});

const Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing;
