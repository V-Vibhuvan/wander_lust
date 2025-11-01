const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStragery = require("passport-local");

const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl } = require("../middleware.js");
const { signup, renderSignup, renderLogin, login, logout } = require("../controllers/user.js");

router.get("/signup", renderSignup);

router.post("/signup", wrapAsync(signup));

router.get("/login" , renderLogin);

router.post("/login",
    saveRedirectUrl,
    passport.authenticate("local", 
        {failureRedirect: "/login",
        failureFlash: true}),
    wrapAsync(login));

router.get("/logout", logout);

module.exports = router;
