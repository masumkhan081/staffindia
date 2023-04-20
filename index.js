const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const ejslayout = require("express-ejs-layouts");
// env vars
require("dotenv").config();
const port = process.env.PORT;
const url = process.env.MONGO_URI;
//
const app = express();
app.set("view engine", "ejs");
app.use(ejslayout);
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(url)
  .then((ans) => {
    console.log("Connected  ");
  })
  .catch((err) => {
    console.log("Error in Connection:  " + err);
  });

app.listen(port, () => {
  console.log("server running ...");
});
const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: true,
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//
app.use("", require("./routes/auth"));
app.use("", require("./routes/user"));
app.use("", require("./routes/task"));
// npm start
