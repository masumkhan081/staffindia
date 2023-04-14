const express = require("express");
const router = express.Router();
// models
const { userModel, taskModel } = require("../model/user");
//
router.get("/", (req, res) => {
  if (req.user == undefined || req.user.status == "null") {
    res.redirect("/auth/signin");
  } else if (
    req.user.status == "logged-in" &&
    req.user.role == "task-creator"
  ) {
    res.redirect("/employees");
  } else if (req.user.status == "logged-in" && req.user.status == "employee") {
    res.redirect("/tasks");
  }
});

router.get("/auth/signin", (req, res) => {
  if (req.user == undefined || req.user.status == "null") {
    res.render("signinpage", { auth_status: "not-logged-in" });
  } else if (
    req.user.status == "logged-in" &&
    req.user.role == "task-creator"
  ) {
    res.redirect("/employees");
  } else if (req.user.status == "logged-in" && req.user.role == "employee") {
    res.redirect("/tasks");
  }
});

router.get("/auth/signup", (req, res) => {
  res.send(
    "New employee account only works with invites over employee email from any admin. (jwt applied )"
  );
});

module.exports = router;
