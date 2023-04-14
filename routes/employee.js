const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
// models
const { userModel, taskModel, obj } = require("../model/user");
const { sendEmail } = require("../controller/emailSender");
require("dotenv").config();
const token_sec = process.env.JWT_SECRET;

router.get("/", (req, res) => {
  let msg = req.flash("msg");
  if (req.user == undefined || req.user.status == "null") {
    res.redirect("/auth/signin");
  } else if (
    req.user.status == "logged-in" &&
    req.user.role == "task-creator"
  ) {
    const { pagenumb } = req.query;
    let skip = 0;
    if (pagenumb) {
      skip = obj.limit * pagenumb - obj.limit;
    }
    userModel
      .find({ role: "employee" })
      .sort({ $natural: -1 })
      .limit(obj.limit)
      .skip(skip)
      .then((employees) => {
        userModel
          .count({})
          .then((count) => {
            msg = count == 0 ? "No Data In System" : msg;
            res.render("employees", {
              auth_status: "logged-in",
              name: req.user.name,
              role: req.user.role,
              designation: req.user.designation,
              role: req.user.role,
              data: employees,
              msg,
              count,
              skip,
              limit: obj.limit,
            });
          })
          .catch((err) => {});
      })
      .catch((err) => {
        res.send("err: find: " + err);
      });
  } else {
    res.redirect("/tasks");
  }
});

router.post("/adduser", (req, res) => {
  const { email, role } = req.body;

  jwt.sign({ role, email }, token_sec, {}, function (err, token) {
    console.log("token: " + token);

    jwt.verify(token, token_sec, function (err, decoded) {
      console.log(JSON.stringify(decoded)); // bar
    });
    const message = `${process.env.BASE_URL}/auth/register/${token}`;
    console.log("msg: " + message);
    sendEmail(email, "Signup @ Employee Task Controll ", token)
      .then((result) => {
        console.log("result:   " + JSON.stringify(result));
        res.render("msg_email_sent", {
          msg: "Inviation mail been sent to: " + email,
          auth_status: "logged-in",
          role: "task-creator",
          name: req.user.name,
          designation: req.user.designation,
        });
      })
      .catch((err) => {
        res.render("msg_email_sent", {
          msg: "Inviation mail been sent to: " + email,
          auth_status: "logged-in",
          role: "task-creator",
          name: req.user.name,
          designation: req.user.designation,
        });
      });
  });
});

module.exports = router;
