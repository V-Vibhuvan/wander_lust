const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/wander_lust";
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);

const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const {listingSchema} = require("./schema.js");
const {reviewSchema} = require("./schema.js")

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

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    //console.log(result); {error} used instead of result
    if(error){  //instead of result.error (if result is used)
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, error); //error instead of result.error 
    } else{
        next();
    }
}

const validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

//Index Route
app.get("/listings", wrapAsync(async (req,res)=>{
    const allListings= await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//New Route
app.get("/listings/new", (req,res)=>{
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews"); //Newly added populate
    res.render("listings/show.ejs", {listing});
}));

//Create Route
app.post("/listings",validateListing, wrapAsync(async (req, res) => {
    console.log(req.body); // <- log the body
    const newListing = new Listing(req.body.listing);
    newListing.save();
    res.redirect("/listings");
}));

//Update Route
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

app.put("/listings/:id",validateListing, wrapAsync(async (req,res) => {
    /*if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listing");
    } is used to throw an error but now a middleware is used*/
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect(`/listings`);
}));

//Reviews
//post
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req,res) =>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

//Delete Review route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async (req,res)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    
    res.redirect(`/listings/${id}`);
}));



// app.get("/testListing",async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the Beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Successful Testing");
// });

app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode = 500 , message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", {err, message});
    //res.status(statusCode).send(message);
});


app.listen(port , ()=>{
    console.log(`Listening to port : ${port}`);
});
