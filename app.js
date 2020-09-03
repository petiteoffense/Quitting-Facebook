//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
// const https = require("https");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
     secret: process.env.SESSION_SECRET,
     resave: false,
     saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_CONNECT, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const friendsSchema = new mongoose.Schema ( {
     name: {
          type: String,
          required: true
     },
     email: String,
     mastodon: String,
     twitter: String,
     diaspora: String,
     wtsocial: String,
     minds: String,
     discord: String,
     steam: String,
     website: String,
     newsletter: String
});

// const usersSchema = new mongoose.Schema ({
//      email: String,
//      password: String
// });

friendsSchema.plugin(passportLocalMongoose);
friendsSchema.plugin(encrypt, {secret: process.env.ENCRYPTION_KEY, encryptedFields: ["email",  "mastodon", "twitter", "diaspora", "wtsocial", "minds", "discord", "steam", "website", "newsletter"]});

const Friend = mongoose.model('Friend', friendsSchema);
// const User = mongoose.model("User", usersSchema);

passport.use(Friend.createStrategy());

passport.serializeUser(Friend.serializeUser());
passport.deserializeUser(Friend.deserializeUser());

// const friendTest = new Friend ( {
//      name: "Bob Test",
//      email: "test@example.com",
//      mastodon: "test@mastodon.online",
//      twitter: "@TestBob",
//      diaspora: "test@diasporchg",
//      wtsocial: "BobTest",
//      minds: "BobTest99",
//      discord: "BobTheBest",
//      steam: "BobTheBest",
//      website: "bobwebsite.me",
//      newsletter: "Yes, for anything"
// });
//
// friendTest.save();
//
// Friend.find(function(err, friend){
//      if (err) {
//           console.log(err);
//      } else {
//           console.log(friend);
//      }
// });

// friendTest2.decrypt(function(err){
//     if (err) { return handleError(err); }
//     console.log(joe.name); // Joe
//     console.log(joe.age); // 42
//     console.log(joe._ct); // undefined
//   });

app.get("/quitting-facebook", function(req, res){

     res.render("authenticate");
});

app.get("/form", function(req, res){
     res.render("form");
});

app.get("/success", function(req, res){
     res.render("success");
});

app.get("/failure", function(req, res){
     res.render("failure");
});

// app.post("/", function(req, res){
//
// });
//
// app.post("/failure", function(req, res){
//      res.redirect("/");
// });

app.listen(process.env.PORT || 3000, function(){
     console.log("Server is running on port 3000.");
});
