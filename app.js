const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride  = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const users = require("./routes/user.js");

//connect to MongoDB database using mongoose 
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

const sessionOption = {
    secret: "my super secret secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    }
};

app.get("/", (req, res) => {
    res.send("Hi i am root");
});

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//middleware to flash messages to all templates
app.use((req, res, next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.currUser = req.user;
    next();
});



app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", users);

app.use((req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

//this is the way of handling error using custom error EXPRESS ERROR class from utils/ExpressError.js
app.use((err, req, res, next) => {
    const {status = 500, message = "Something went wrong"} = err;
    let returnTo = "/listings";
    if (req.session && req.session.returnTo) {
        returnTo = req.session.returnTo;
        delete req.session.returnTo;
    }
    res.status(status).render("error.ejs", {message, status, returnTo});
});

let port = 8080;
app.listen(port, () => {
    console.log(`server is listening to port ${port}`);
});
