const express = require("express");
const router = express.Router();
const passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
// models
const { userModel, taskModel } = require("../model/user");

passport.use(
  new LocalStrategy(async function (username, password, done) {
    const user = await userModel.findOne({ email: username, password }, null);
    if (!user) {
      return done(null, { status: "null", email: username, password }); // i can cut email from here...
    } else {
      return done(null, {
        id: user.id,
        status: "logged-in",
        email: username,
        password,
        role: user.role,
        name: user.name,
        designation: user.designation,
      });
    }
  })
);
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

//     -----------------------------------------------       SIGN IN
router.post("/auth/signin", passport.authenticate("local"), (req, res) => {
  if (req.user.status == "null") {
    res.render("signinpage", {
      errors: ["No account associated with this email"],
      email: req.body.username,
      password: req.body.password,
      auth_status: "null",
    });
  } else if (
    req.user.status == "logged-in" &&
    req.user.role == "task-creator"
  ) {
    res.redirect("/employees");
  } else if (req.user.status == "logged-in" && req.user.role == "employee") {
    res.redirect("/tasks");
  }
});

router.get("/auth/signout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      res.send("error loging out !");
    }
    res.redirect("/auth/signin");
  });
});

router.post("/auth/register", (req, res) => {
  const { name, email, password, confirmpassword } = req.body;
  let errors = [];
  let errs = do_check(req.body, "register");
  if (errs.error) {
    // console.log("if-errors");
    errors = errs.error.details.map((err) => {
      return err.message;
    });
    res.render("authPage", {
      errors,
      name,
      email,
      password,
      loggedin: false,
    });
  } else {
    console.log("if-no errors   " + email);
    userModel
      .findOne({ email: email })
      .then((data) => {
        if (data) {
          errors.push("Email alraedy registered");
          res.render("authPage", {
            errors,
            name,
            email,
            password,
            loggedin: false,
          });
        } else {
          const user = new userModel({
            name,
            email,
            password,
          });
          user
            .save()
            .then((savedUser) => {
              let validationToken = crypto
                .createHash("sha256")
                .update(savedUser.email)
                .digest("hex");

              str = get_calculatedTime();
              let newToken = new tokenModel({
                userId: savedUser._id,
                token: validationToken,
                expires: str,
              });
              newToken
                .save()
                .then((savedToken) => {
                  console.log("tkn:  " + savedToken.token);
                  const message = `${process.env.BASE_URL}/verify/${savedUser.id}/${savedToken.token}`;
                  sendEmail(savedUser.email, "Verify Email", message)
                    .then((emailResult) =>
                      res.render("plzVerify", {
                        email: savedUser.email,
                        loggedin: false,
                      })
                    )
                    .catch((err) =>
                      console.log("error sending verification email")
                    );
                })
                .catch((err) => console.log("error saving new token in db"));
            })
            .catch((err) => {
              res.send("error saving new user");
            });
        }
      })
      .catch((err) => {
        console.log("::in catch -> err::  " + JSON.stringify(err));

        res.send(err);
      });
    console.log("::nothing ::  ");
  }
});

module.exports = router;
