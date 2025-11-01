const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

//Middlewares
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

//Controllers
const { index, renderNewForm, showListing, createListing, editForm, updateListing, destroyListing } = require("../controllers/listings.js");

// router.route("/")
//     .get("/", wrapAsync(index))//Index Route
//     .post("/",validateListing, wrapAsync(createListing)); //Create Route


//Index Route
router.get("/", wrapAsync(index));

//New Route
router.get("/new",isLoggedIn, renderNewForm);

//Show Route
router.get("/:id", wrapAsync(showListing));

//Create Route
router.post("/",isLoggedIn,validateListing,upload.single("image"), wrapAsync(createListing));


//Update Route
router.get("/:id/edit",isLoggedIn,wrapAsync(editForm));
router.put("/:id",isLoggedIn,isOwner,validateListing,upload.single("image"), wrapAsync(updateListing));


//delete Route
router.delete("/:id", isLoggedIn, wrapAsync(destroyListing));

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
