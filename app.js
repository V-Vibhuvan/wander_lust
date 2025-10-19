const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStragery = require("passport-local");
const User = require("./models/user.js");

const sessionOptions = {
    secret: "debugLife",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
        maxAge: 1000* 60 * 60 * 24 * 3,
        httpOnly : true
    },
};

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/wander_lust";

app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);

const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listings.js")
const review = require("./routes/review.js");
const userRouter = require("./routes/user.js");

main()
    .then(()=>{
        console.log(`Connected to DB`);
    })
    .catch((err)=>{
        console.log(err);
    });

async function main(){
    await mongoose.connect(MONGO_URL);
}
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));

app.get("/", (req,res)=>{
    res.send("Hi I am root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStragery(User.authenticate()));  //static default method by mongoose(authenticate())
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async (req,res)=>{
//     let fakeUser = new User({
//         email: "abc@gmail.com",
//         username: "beems",
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

app.use("/listings", listings);
app.use("/listings/:id/reviews",review);
app.use("/", userRouter);

app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode = 500 , message = "Something went wrong!" } = err;
    //let errMsg = error.details.map(el => el.message).join(",");
    res.status(statusCode).render("error.ejs", {err, message});
    //res.status(statusCode).send(message);
});


app.listen(port , ()=>{
    console. log(`Listening to port : ${port}`);
});
