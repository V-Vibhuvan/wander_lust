const Listing = require("../models/listing.js");

// Map-box sdk
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" },
        })
        .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing, currUser: req.user });
};

module.exports.createListing = async (req, res) => {
    try {
        //Map Updates
        let response = await geocodingClient
                .forwardGeocode({
                query: req.body.listing.location,
                limit: 1
                })
                .send();
        
        // console.log(req.file);
        // console.log(req.body);
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        // File uploading
        if(typeof req.file != "undefined"){
        //if (req.file) {
            newListing.image.filename = req.file.originalname;
            newListing.image.url = req.file.path;
        }
        newListing.geometry = response.body.features[0].geometry;

        await newListing.save();
        req.flash("success", "New Listing Created");
        res.redirect("/listings");
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/listings/new");
    }
};

module.exports.editForm = async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    //Any modifications in the image required ...
    let originalImageUrl = listing.image.url;
    originalImageUrl.replace("/upload/", "/upload/h_300,w_250");

    res.render("listings/edit.ejs",{ listing, currUser: req.user });
};

module.exports.updateListing = async (req, res) => {
    try {
        let { id } = req.params;

        // File uploading
        if(typeof req.file != "undefined"){
        //if (req.file) {
            const listing = await Listing.findById(id);
            listing.image.filename = req.file.originalname;
            listing.image.url = req.file.path;
            await listing.save();
        }

        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        req.flash("success", "Listing Updated");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        req.flash("error", err.message);
        res.redirect(`/listings/${id}/edit`);
    }
};

module.exports.destroyListing = async (req,res)=>{
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};
