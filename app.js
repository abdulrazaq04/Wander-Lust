const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js"); 
const path = require("path");
const methodOverride  = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const { log } = require("console");
const session = require("express-session");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main()
    .then(() => {
        console.log("connected to DB");
    }).catch((err) => {
        console.log(err);
    });
async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//session configuration wiith cookie settings and express-session setup
app.use(session({
    secret: "yourSecretKeyHere",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // 1-week cookie expiration
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));



app.get("/", (req, res) => {
    res.send("Hi i am root");
});


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
app.get("/listings", wrapAsync(async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//new route
app.get("/listings/new", wrapAsync(async (req, res, next) => {
    res.render("listings/new.ejs")
}));

//show route
app.get("/listings/:id", wrapAsync(async (req, res, next) => {
    let {id} = req.params; 
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

//Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    //this can be used if you want to validate without middleware function 
    // let result = listingSchema.validate(req.body);
    // console.log(result);
    // if(result.error){
    //     throw new ExpressError(result.error.details.map(el => el.message).join(","), 400);
    // }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//Edit route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params; 
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//update route // validateListing is a middleware function is used here to validate the updated data 
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//delete route
app.delete("/listings/:id", wrapAsync(async (req, res, next) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// app.get("/testlisting", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calungute, Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

//this is the general way of handling error using ASYNCWRAP frunction from utils/wrapAsync.js
// app.use((err, req, res, next) => {
//     // const {status = 500, message = "Something went wrong"} = err;
//     // console.log(err);
//     // res.send(err.me);    ///this is the one way of sending direct mongoose error
//     res.send("Oh no, something went wrong!"); //this is the general error sending to the web page
// });

app.use((req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

//this is the way of handling error using custom error EXPRESS ERROR class from utils/ExpressError.js
app.use((err, req, res, next) => {
    const {status = 500, message = "Something went wrong"} = err;
    const returnTo = req.session.returnTo || "/listings"; 
    delete req.session.returnTo;
    res.status(status).render("error.ejs", {message, status, returnTo});
    // res.status(status).send(message);
});

let port = 8080;
app.listen(port, () => {
    console.log(`server is listening to port ${port}`);
});
