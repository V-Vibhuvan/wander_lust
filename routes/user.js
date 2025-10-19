const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const LocalStragery = require("passport-local");

const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req,res) =>{
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req,res)=>{
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        //Optimization
        req.login(registeredUser, (err)=>{
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        });
        //Before Optimization or default login api
        // req.flash("success", "Welcome to Wanderlust");
        // res.redirect("/listings");
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.get("/login" , (req,res) =>{
    res.render("users/login.ejs");
});

router.post("/login",
    saveRedirectUrl,
    passport.authenticate("local", 
        {failureRedirect: "/login",
        failureFlash: true}),
    wrapAsync(async (req,res)=>{
        req.flash("success", "Welcome Back!!!");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
}));

router.get("/logout", (req,res)=>{
    req.logOut((err) =>{
        if(err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
})

module.exports = router;
