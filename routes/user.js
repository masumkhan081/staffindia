const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
// models  & controller
const { userModel, taskModel, render_properties } = require("../model/models");
const { render_employees } = require("../controller/render_employees");
const { sendEmail } = require("../controller/emailSender");
require("dotenv").config();
const token_sec = process.env.JWT_SECRET;
//
router.get("/user/team-leaders", (req, res) => {
  if (req.user == undefined || req.user.status == "null") {
    res.redirect("/auth/signin");
  } else {
    const { role } = req.user;
    if (role == "admin") {
      req.flash("data_title", "Team Leaders/Project Managers");
      render_employees(req, res, { role: "team-leader" }, "team-leaders");
    } else if (role == "team-leader") {
      req.flash("msg", "No business with other my-team");
      res.redirect("/user/my-team");
    } else if (role == "team-member") {
      res.redirect("/tasks/my-tasks");
    }
  }
});

router.get("/user/my-team", (req, res) => {
  //let msg = req.flash("msg");
  if (req.user == undefined || req.user.status == "null") {
    res.redirect("/auth/signin");
  } else {
    const { role } = req.user;
    if (role == "admin") {
      res.redirect("/user/team-leaders");
    } else if (role == "team-leader") {
      req.flash("data_title", "My team members");
      render_employees(req, res, { added_by: req.user.id },"my-team");
    } else if (role == "team-member") {
      res.redirect("/tasks/my-tasks");
    }
  }
});

router.get("/user/remove", (req, res) => {
  const { employeeid, pagenumb } = req.query;
  userModel
    .findByIdAndDelete({ _id: employeeid })
    .then((result) => {
      req.flash("msg", "Successfully Deleted.");
      res.redirect("/employees/?pagenumb=" + pagenumb);
    })
    .catch((err) => {
      console.log("err:  " + JSON.stringify(err));
    });
});

router.post("/user/invite", (req, res) => {
  const { to_mail, role, designation, subject, mail_text } = req.body;
  console.log("reached .. ");
  jwt.sign(
    {
      role,
      email: to_mail,
      designation,
      added_by: req.user.id,
      added_by_name: req.user.name,
    },
    token_sec,
    {},
    function (err, token) {
      const signup_link = `${process.env.BASE_URL}/auth/register?token=${token}`;
      console.log("signup_link : " + to_mail);
      //
      sendEmail(to_mail, subject, signup_link, mail_text)
        .then((result) => {
          console.log("result:   " + JSON.stringify(result));
          res.render("page_after_invite", {
            msg: "Inviation mail been sent to: " + to_mail,
            auth_status: "logged-in",
            role: req.user.role,
            name: req.user.name,
            designation: req.user.designation,
          });
        })
        .catch((err) => {
          res.render("page_after_invite", {
            msg: "Failed To Send Inviation Link To: " + to_mail,
            auth_status: "logged-in",
            role: req.user.role,
            name: req.user.name,
            designation: req.user.designation,
          });
        });
    }
  );
});

module.exports = router;
