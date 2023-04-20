const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
require("dotenv").config();
const token_sec = process.env.JWT_SECRET;
// models
const { userModel, taskModel } = require("../model/models");

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

router.get("/", (req, res) => {
  if (req.user == undefined || req.user.status == "null") {
    res.render("page_landing", { auth_status: "null", msg: "" });
  } else {
    const { name, designation, role } = req.user;
    if (role == "admin" || role == "team-member" || role == "team-leader") {
      res.render("page_landing", {
        name,
        role,
        designation,
        auth_status: "logged-in",
        msg: "",
      });
    }
    // res.redirect("/user/team-leaders");   "/tasks/allocated-tasks"    "/tasks/my-tasks"
  }
});

router.get("/auth/signin", (req, res) => {
  if (req.user == undefined || req.user.status == "null") {
    res.render("page_signin", { auth_status: "null", msg: req.flash("msg") });
  } else {
    const { role } = req.user;
    if (role == "admin") {
      res.redirect("/user/team-leaders");
    } else if (role == "team-leader" || role == "team-member") {
      req.flash("msg", "Log out first please.");
      res.redirect("/tasks/my-tasks");
    }
  }
});

router.get("/auth/signup", (req, res) => {
  res.send(
    "New employee account only works with invites over employee email from any admin/ team-leader. (jwt applied )"
  );
});

//     -----------------------------------------------       SIGN IN
router.post("/auth/signin", passport.authenticate("local"), (req, res) => {
  if (req.user.status == "null") {
    res.render("page_signin", {
      email: req.body.username,
      password: req.body.password,
      auth_status: "null",
      msg: "No account associated with this email",
    });
  } else {
    const { role } = req.user;
    if (role == "admin") {
      res.redirect("/user/team-leaders");
      // res.redirect("/tasks/allocated-tasks");
    }
    if (role == "team-leader" || role == "team-member") {
      res.redirect("/user/my-team");
      // res.redirect("/tasks/my-tasks");
    }
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

router.get("/auth/register", (req, res) => {
  const { token } = req.query;
  jwt.verify(token, token_sec, function (err, decoded) {
    if (decoded) {
      console.log(JSON.stringify(decoded));
      let email = decoded.email;
      let role = decoded.role;
      let added_by = decoded.added_by;
      let added_by_name = decoded.added_by_name;
      let designation =
        decoded.designation == undefined ? "Not Set" : decoded.designation;
      res.render("page_signup", {
        auth_status: "null",
        role,
        email,
        designation,
        added_by,
        added_by_name: "test khan",
      });
    }
  });
});

router.post("/auth/register", (req, res) => {
  const {
    name,
    role,
    added_by,
    added_by_name,
    designation,
    email,
    password,
    confirmpassword,
    email2,
  } = req.body;
  //
  console.log(
    "added_by, added_by_name:   " + added_by + " <> " + added_by_name
  );
  let errors = [];
  if (name.length < 2) {
    errors.push("Name Too Short");
  }
  if (password != confirmpassword) {
    errors.push("Dissimilar passwords");
  }
  checkExistence(email).then((existance) => {
    if (existance.exist == true) {
      act = "update";
      errors.push("Email already registered ");
      errors.push(
        "Found: " +
          existance.name +
          "-" +
          existance.designation +
          "-" +
          existance.role
      );
    }
    if (errors.length > 0) {
      res.render("page_signup", {
        auth_status: "null",
        errors,
        name,
        role,
        designation,
        added_by,
        added_by_name,
        email,
        email2,
        password,
        confirmpassword,
      });
    } else {
      const newUser = new userModel({
        name,
        email,
        role,
        designation,
        added_by,
        sec_email: email2,
        password,
      });
      newUser
        .save()
        .then((result) => {
          console.log(JSON.stringify(result));
          req.flash("msg", "Account Being Created. You may log in now");
          res.redirect("/auth/signin");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
  // else {
  //   console.log("if-no errors   " + email);
  //   userModel
  //     .findOne({ email: email })
  //     .then((data) => {
  //       if (data) {
  //         errors.push("Email alraedy registered");
  //         res.render("authPage", {
  //           errors,
  //           name,
  //           email,
  //           password,
  //           loggedin: false,
  //         });
  //       } else {
  //         const user = new userModel({
  //           name,
  //           email,
  //           password,
  //         });
  //         user
  //           .save()
  //           .then((savedUser) => {
  //             let validationToken = crypto
  //               .createHash("sha256")
  //               .update(savedUser.email)
  //               .digest("hex");

  //             str = get_calculatedTime();
  //             let newToken = new tokenModel({
  //               userId: savedUser._id,
  //               token: validationToken,
  //               expires: str,
  //             });
  //             newToken
  //               .save()
  //               .then((savedToken) => {
  //                 console.log("tkn:  " + savedToken.token);
  //                 const message = `${process.env.BASE_URL}/verify/${savedUser.id}/${savedToken.token}`;
  //                 sendEmail(savedUser.email, "Verify Email", message)
  //                   .then((emailResult) =>
  //                     res.render("plzVerify", {
  //                       email: savedUser.email,
  //                       loggedin: false,
  //                     })
  //                   )
  //                   .catch((err) =>
  //                     console.log("error sending verification email")
  //                   );
  //               })
  //               .catch((err) => console.log("error saving new token in db"));
  //           })
  //           .catch((err) => {
  //             res.send("error saving new user");
  //           });
  //       }
  //     })
  //     .catch((err) => {
  //       console.log("::in catch -> err::  " + JSON.stringify(err));

  //       res.send(err);
  //     });
  //   console.log("::nothing ::  ");
  // }
});
async function checkExistence(email) {
  return await userModel
    .findOne({ email: email })
    .then((user) => {
      if (user) {
        console.log(" exist: true");
        return {
          exist: true,
          role: user.role,
          name: user.name,
          designation: user.designation,
        };
      } else {
        console.log(" exist: false");
        return { exist: false };
      }
    })
    .catch((err) => {
      console.log("::  " + JSON.stringify(err));
      return err;
    });
}
module.exports = router;
