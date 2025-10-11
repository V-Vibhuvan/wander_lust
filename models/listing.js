const { ref } = require("joi");
const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        filename: {
            type: String,
            default: "listingimage",
        },
        url: {
            type: String,
            set: (v) =>
                v === ""
                    ? "https://images.unsplash.com/photo-1758797849614-aea4f74fb056?q=80&w=685&auto=format&fit=crop"
                    : v,
        },
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing)
        await Review.deleteMany({_id: {$in : listing.reviews}});
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
