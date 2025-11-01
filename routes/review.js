const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const { createReview, destroyReview } = require("../controllers/reviews.js");


//Reviews
//post
router.post("/",isLoggedIn, validateReview, wrapAsync(createReview));

//Delete Review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(destroyReview));

module.exports = router;
