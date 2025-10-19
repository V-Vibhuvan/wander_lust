const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wander_lust";
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

const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => (
        {...obj, owner: "68f3b6e0f2fee842f4239b19"} 
    ));
    await Listing.insertMany(initData.data);
    console.log(`Data was Initialized`);
};

initDB();