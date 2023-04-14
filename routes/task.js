const express = require("express");
const router = express.Router();
const {
  render_given_tasks,
  render_assigned_tasks,
  render_my_tasks,
} = require("../controller/render_tasks");
// models
const { userModel, taskModel } = require("../model/user");

router.get("/tasks", (req, res) => {
  if (req.user == undefined || req.user.status == "null") {
    res.redirect("/auth/signin");
  } else if (
    req.user.status == "logged-in" &&
    req.user.role == "task-creator"
  ) {
    render_given_tasks(req, res);
  } else if (req.user.status == "logged-in" && req.user.role == "employee") {
    render_my_tasks(req, res);
  }
});

router.get("/tasks/add", (req, res) => {
  res.render("addform");
});

router.post("/tasks/add", (req, res) => {
  const { taskname, duedate, to, date, detail } = req.body;
  const task = new taskModel({
    taskname,
    duedate,
    to,
    date,
    by: req.user.id,
    status: false,
    detail,
  });
  task
    .save()
    .then((result) => {
      console.log(JSON.stringify(result));
      res.redirect("/tasks");
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
