const User = require("../models/user.js");

// controllers/users.js signup
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

// Signup post route
module.exports.signup = async (req, res) => {
    try{
    let {username, email, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if(err){return next(err);}
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
    })
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/signup");
    }
};

// controllers/users.js login
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

// routes/user.js login post route
module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back To Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// routes/user.js logout route
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
};