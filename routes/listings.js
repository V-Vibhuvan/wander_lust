const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require("../models/listing.js");

const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");


//Index Route
router.get("/", wrapAsync(async (req,res)=>{
    const allListings= await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//New Route
router.get("/new",isLoggedIn, (req,res)=>{    
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
                    .populate({
                        path: "reviews",
                        populate: ({
                            path: "author"
                        }),  
                    })
                    .populate("owner"); //Newly added populate
    if(!listing){
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    //console.log(listing);
    res.render("listings/show.ejs", {listing});
}));

//Create Route
router.post("/",validateListing, wrapAsync(async (req, res) => {
    console.log(req.body); // <- log the body
    const newListing = new Listing(req.body.listing);
    //Authorization - updated
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success" ,"New Listing Created");
    res.redirect("/listings");
}));

//Update Route
router.get("/:id/edit",isLoggedIn,wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
}));

router.put("/:id",isLoggedIn,isOwner,validateListing, wrapAsync(async (req,res) => {
    /*if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listing");
    } is used to throw an error but now a middleware is used*/
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success" ,"Listing Updated");
    res.redirect(`/listings/${id}`);
}));

router.delete("/:id", isLoggedIn, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success" ,"Listing Deleted");
    res.redirect(`/listings`);
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

module.exports = router;
