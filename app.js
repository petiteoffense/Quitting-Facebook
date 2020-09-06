//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const session = require("express-session");
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

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_CONNECT, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const friendsSchema = new mongoose.Schema ( {
     previousSubmission: Boolean,
     dateOfEntry: {
          type: String,
          required: true
     },
     dateOfLastUpdate: String,
     facebook: {
          id: {
               type: String,
               required: true
          },
          token: {
               type: String,
               required: true
          },
          displayName: {
               type: String,
               required: true
          }
     },
     name: String,
     email: String,
     phone: String,
     mastodon: String,
     twitter: String,
     diaspora: String,
     wtsocial: String,
     minds: String,
     discord: String,
     steam: String,
     website: String,
     newsletter: String,
     otherInfo: String
});


// friendsSchema.plugin(encrypt, {secret: process.env.ENCRYPTION_KEY, encryptedFields: ["facebook", "email",  "mastodon", "twitter", "diaspora", "wtsocial", "minds", "discord", "steam", "website", "newsletter"]});

const Friend = mongoose.model('Friend', friendsSchema);

passport.serializeUser(function(friend, done){
     done(null, friend.id);
});

passport.deserializeUser(function(id, done){
     Friend.findById(id, function(err, friend){
          done(err, friend);
     });
});

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
     function(accessToken, refreshToken, profile, done) {
         process.nextTick(function(){
              Friend.findOne({"facebook.id": profile.id}, function(err, friend){
                   if (err) {
                        return done(err);
                   }
                   if (friend) {
                        return done(null, friend);
                   } else {
                        const date = new Date();

                        const newFriend = new Friend({
                             dateOfEntry: date,
                             facebook: {
                                  id: profile.id,
                                  token: accessToken,
                                  displayName: profile.displayName
                              }
                        });

                        newFriend.save(function(err){
                             if(err) {
                                  throw err;
                             } else {
                                  return done(null, newFriend);
                             }
                        });
                    }

              });
         });
      }
  ));

app.get("/quitting-facebook", function(req, res){
     res.render("password-wall");
});

app.post("/quitting-facebook", function(req, res){
     const enteredPassword = req.body.password;
     const storedPassword = process.env.PASSWORD;

     if (enteredPassword === storedPassword) {
          res.render("quitting-facebook");
     } else {
          res.render("failure");
     }


});

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/quitting-facebook/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/quitting-facebook/auth/facebook/form',
     passport.authenticate('facebook', {
          failureRedirect: '/quitting-facebook/failure'
     }),
     function(req, res) {
          // Successful authentication
          res.redirect("/quitting-facebook/form");

     });

app.get("/quitting-facebook/form", function(req, res){
     if (req.isAuthenticated()){
          if (req.user.previousSubmission === true) {
               res.redirect("/quitting-facebook/update");
          } else {
               const fbDisplayName = req.user.facebook.displayName;
               res.render('form', {fbDisplayName: fbDisplayName});
          }
     } else {
          res.redirect("/quitting-facebook");
     }
});

app.post("/quitting-facebook/form", function(req, res){
     if (req.isAuthenticated()){
          const date = new Date();

          Friend.updateOne({"facebook.id": req.user.facebook.id}, {
               "previousSubmission": true,
               "dateOfLastUpdate": date,
               "name": req.body.name,
               "phone": req.body.phoneNumber,
               "email": req.body.email,
               "mastodon": req.body.mastodonHandle,
               "twitter": req.body.twitterHandle,
               "diaspora": req.body.diasporaUser,
               "wtsocial": req.body.wtsocialUser,
               "minds": req.body.mindsUser,
               "discord": req.body.discordUser,
               "steam": req.body.steamUser,
               "website": req.body.blog,
               "newsletter": req.body.newsletter,
               "otherInfo": req.body.other
          }, function(err){
               if (err) {
                    console.log(err);
                    res.render("failure");
               } else {
                    const storedName = req.body.name;
                    const storedPhone = req.body.phoneNumber;
                    const storedEmail = req.body.email;
                    const storedMastodon = req.body.mastodonHandle;
                    const storedTwitter = req.body.twitterHandle;
                    const storedDiaspora = req.body.diasporaUser;
                    const storedWtsocial = req.body.wtsocialUser;
                    const storedMinds = req.body.mindsUser;
                    const storedDiscord = req.body.discordUser;
                    const storedSteam = req.body.steamUser;
                    const storedWebsite = req.body.blog;
                    const storedNewsletter = req.body.newsletter;
                    const storedOther = req.body.other;

                    const myEmail = process.env.MY_EMAIL;
                    const myPhone = process.env.MY_PHONE;
                    const myMastodon = process.env.MY_MASTODON;
                    const myDiaspora = process.env.MY_DIASPORA;
                    const myWtsocial = process.env.MY_WTSOCIAL;
                    const myMinds = process.env.MY_MINDS;
                    const myDiscord = process.env.MY_DISCORD;
                    const mySteam = process.env.MY_STEAM;
                    const myWebsite = process.env.MY_WEBSITE;


                    res.render('success', {
                         storedName: storedName,
                         storedEmail: storedEmail,
                         storedPhone: storedPhone,
                         storedMastodon: storedMastodon,
                         storedTwitter: storedTwitter,
                         storedDiaspora: storedDiaspora,
                         storedWtsocial: storedWtsocial,
                         storedMinds: storedMinds,
                         storedDiscord: storedDiscord,
                         storedSteam: storedSteam,
                         storedWebsite: storedWebsite,
                         storedNewsletter: storedNewsletter,
                         storedOther: storedOther,
                         myEmail: myEmail,
                         myPhone: myPhone,
                         myMastodon: myMastodon,
                         myDiaspora: myDiaspora,
                         myWtsocial: myWtsocial,
                         myMinds: myMinds,
                         myDiscord: myDiscord,
                         mySteam: mySteam,
                         myWebsite: myWebsite
                    });
               }
          });
     } else {
          res.redirect("/quitting-facebook");
     }
});


app.get("/quitting-facebook/update", function(req, res){
     if (req.isAuthenticated()){
          const storedName = req.user.name;
          const storedEmail = req.user.email;
          const storedPhone = req.user.phone;
          const storedMastodon = req.user.mastodon;
          const storedTwitter = req.user.twitter;
          const storedDiaspora = req.user.diaspora;
          const storedWtsocial = req.user.wtsocial;
          const storedMinds = req.user.minds;
          const storedDiscord = req.user.discord;
          const storedSteam = req.user.steam;
          const storedWebsite = req.user.website;
          const storedNewsletter = req.user.newsletter;
          const storedOther = req.user.otherInfo;

          res.render('update', {
               storedName: storedName,
               storedEmail: storedEmail,
               storedPhone: storedPhone,
               storedMastodon: storedMastodon,
               storedTwitter: storedTwitter,
               storedDiaspora: storedDiaspora,
               storedWtsocial: storedWtsocial,
               storedMinds: storedMinds,
               storedDiscord: storedDiscord,
               storedSteam: storedSteam,
               storedWebsite: storedWebsite,
               storedNewsletter: storedNewsletter,
               storedOther: storedOther
          });
     } else {
          res.redirect("/quitting-facebook");
     }
});

app.get("/quitting-facebook/delete", function(req, res){
     if (req.isAuthenticated()){

          Friend.deleteOne({"facebook.id": req.user.facebook.id}, function(err){
               if(err) {
                    console.log(err);
                    res.render("failure");
               } else {
                    res.render("success-delete");
               }
          });
     } else {
          res.redirect("failure");
     }
});

app.get("/quitting-facebook/privacy-policy", function(req, res){
     res.render("privacy-policy");
});

app.listen(process.env.PORT || 3000, function(){
     console.log("Server is running on port 3000.");
});
