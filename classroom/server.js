const express = require("express");
const app = express();
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const sessionOptions = {
  secret: "debug life",  //required and must
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));


app.set('trust proxy', 1) // trust first proxy
app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next) =>{
    res.locals.messages = req.flash("success");
    next();
});

app.get("/register", (req,res)=>{
    let {name = "anonymous"} = req.query;
    req.session.name = name;
    req.flash("success", "user registered successfully!")
    res.redirect("/hello");
});

app.get("/hello", (req,res)=>{
    res.render("page.ejs",{name: req.session.name})
});


app.get("/test",(req,res)=>{
    res.send(`Test Successful`);
});

// app.get("/", (req,res)=>{
//     res.send("Hi, I am root");
// });

// app.use("/users", users);
// app.use("/posts", posts);

app.listen(3000,()=>{
    console.log(`Server is listening`);
})