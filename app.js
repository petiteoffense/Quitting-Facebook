//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
// const https = require("https");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const session = require("express-session");
// const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");
const passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
     secret: process.env.SESSION_SECRET,
     resave: false,
     saveUninitialized: false
}));

// app.use(passport.initialize());
// app.use(passport.session());

mongoose.connect(process.env.MONGO_CONNECT, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const friendsSchema = new mongoose.Schema ( {
     dateofentry: {
          type: String,
          required: true
     },
     facebook: {
          provider: String,
          id: {
               type: String,
               required: true
          },
          displayName: {
               type: String,
               required: true
          },
          name: {
               familyName: String,
               givenName: String,
               middleName: String
          },
          emails: [
               {
               value: String,
               type: String
               }
          ],
          photos: [
               {
               value: String
               }
          ]
     },
     name: String,
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

// friendsSchema.plugin(passportLocalMongoose);
friendsSchema.plugin(encrypt, {secret: process.env.ENCRYPTION_KEY, encryptedFields: ["email",  "mastodon", "twitter", "diaspora", "wtsocial", "minds", "discord", "steam", "website", "newsletter"]});

const Friend = mongoose.model('Friend', friendsSchema);
// const User = mongoose.model("User", usersSchema);


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "https://arcane-scrubland-72310.herokuapp.com/quitting-facebook/auth/facebook/callback"
  },
     function(accessToken, refreshToken, profile, done) {
          //check user table for anyone with a facebook ID of profile.id
          Friend.findOne({
              'facebook.id': profile.id
         }, function(err, friend) {
              if (err) {
                  return done(err);
              }
              //No user was found... so create a new user with values from Facebook (all the profile. stuff)
              if (!friend) {
                  friend = new Friend ({
                      //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
                      facebook: profile._json
                  });
                  friend.save(function(err) {
                      if (err) {
                           console.log(err);
                           res.render("failure");
                      }
                      return done(err, friend);
                  });
              } else {
                  //found user. Return
                  return done(err, friend);
              }
          });
      }
  ));
// passport.use(Friend.createStrategy());

// passport.serializeUser(Friend.serializeUser());
// passport.deserializeUser(Friend.deserializeUser());

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

     res.render("quitting-facebook");
});

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/quitting-facebook/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/quitting-facebook/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/quitting-facebook/form',
                                      failureRedirect: '/quitting-facebook/failure' }));

// app.get("/quitting-facebook/authenticate", function(req, res){
//      var facebookResponse = FB.getLoginStatus(function(response) {
//           statusChangeCallback(response);
//           });
//
//      if (facebookResponse === "connected") {
//           res.render("form");
//      } else if (facebookResponse === "not_authorized") {
//           // umm like store a session cookie or something?
//           // then
//           //save relevant fb info to database
//           // then
//           FB.login(function(response) {
//                if (response.status === "connected") { //should also probably double-check that a document has been created with the fb info
//                     res.render("form");
//                } else {
//                     res.render("failure");
//                }
//           });
//      } else if (facebookResponse === "unknown") {
//           FB.login(function(response) {
//                if (response.status === "connected") { //should also probably double-check that a document has been created with the fb info
//                     // umm like store a session cookie or something?
//                     // then
//                     //save relevant fb info to database
//                     // then
//                     res.render("form");
//                } else {
//                     res.render("failure");
//                }
//           });
//      } else {
//           res.render("failure");
//      }
// });

app.get("/quitting-facebook/form", function(req, res){
     res.render("form");
});

app.get("/success", function(req, res){
     res.render("success");
});

app.get("/quitting-facebook/failure", function(req, res){
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
