//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);



app.get("/quitting-facebook", function (req, res) {
     res.render("quitting-facebook");
});

app.post("/quitting-facebook", function (req, res) {
     const enteredPassword = req.body.password;
     const storedPassword = process.env.PASSWORD;

     if (enteredPassword === storedPassword) {
          res.render("form");
     } else {
          res.render("failure");
     }


});

app.post("/quitting-facebook/form", function (req, res) {

     const date = new Date();

     const updatedContact = new Contact({
          dateOfEntry: date,
          name: req.body.name,
          phone: req.body.phoneNumber,
          email: req.body.email,
          mastodon: req.body.mastodonHandle,
          twitter: req.body.twitterHandle,
          diaspora: req.body.diasporaUser,
          wtsocial: req.body.wtsocialUser,
          minds: req.body.mindsUser,
          discord: req.body.discordUser,
          steam: req.body.steamUser,
          website: req.body.blog,
          newsletter: req.body.newsletter,
          otherInfo: req.body.other
     });

     updatedContact.save(function (err) {
          if (err) {
               console.log(err);
               res.render("failure");
          }

          //prepare submitted data to be passed into the success page for review
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

          //prepare own contact data to be shared with user on success page
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
     });
});

app.listen(process.env.PORT || 3000, function () {
     console.log("Server is running on port 3000.");
});
