const express = require("express");
const router = express.Router();
const {
  render_given_tasks,
  render_tasks,
  render_assigned_tasks,
} = require("../controller/render_tasks"); // controllers
const { userModel, taskModel, render_properties } = require("../model/models"); //-------MODELS
//
//
router.get("/tasks", (req, res) => {
  res.redirect("/tasks/my-tasks");
});

router.get("/tasks/my-tasks", (req, res) => {
  if (req.user == undefined || req.user.status == "null") {
    res.redirect("/auth/signin");
  } else {
    const { role } = req.user;
    if (role == "admin") {
      res.redirect("/tasks/allocated-tasks");
    } else if (role == "team-leader" || role == "team-member") {
      req.flash("data_title", "To Do Tasks");
      render_tasks(req, res, { to_id: req.user.id }, "my-tasks");
    }
  }
});
router.get("/tasks/allocated-tasks", (req, res) => {
  if (req.user == undefined || req.user.status == "null") {
    res.redirect("/auth/signin");
  } else {
    const { role } = req.user;
    if (role == "admin" || role == "team-leader") {
      req.flash("data_title", "Tasks I Have Assigned To Others");
      render_tasks(req, res, { by_id: req.user.id }, "allocated-tasks");
    } else if (role == "team-member") {
      res.redirect("/tasks/my-tasks");
    }
  }
});

router.get("/tasks/assigned-tasks/:assignedto", (req, res) => {
  if (req.user == undefined || req.user.status == "null") {
    res.redirect("/auth/signin");
  } else {
    const { role } = req.user;
    if (role == "admin" || role == "team-leader") {
      req.flash("data_title", "Tasks I Have Assigned To Others");
      render_assigned_tasks(req, res, { to_id: req.params.assignedto });
    } else if (role == "team-member") {
      res.redirect("/tasks/my-tasks");
    }
  }
});

router.post("/tasks/allocated-tasks/delete", (req, res) => {
  const { taskid, pagenumb } = req.body;
  console.log("reachd .... " + pagenumb);
  taskModel
    .findByIdAndDelete({ _id: taskid })
    .then((result) => {
      req.flash("msg", "Successfully Deleted.");
      res.redirect("/tasks/allocated-tasks/?pagenumb=" + pagenumb);
    })
    .catch((err) => {
      console.log(JSON.stringify(err));
    });
});

router.post("/tasks/add", (req, res) => {
  const { task_name, due_time, to_id, assign_time, detail, to_name, by_name } =
    req.body;

  const task = new taskModel({
    task_name,
    due_time,
    to_id,
    to_name,
    by_name,
    assign_time,
    by_id: req.user.id,
    status: "assigned",
    starting_time: "",
    completion_time: "",
    seen_time: "",
    detail,
  });
  task
    .save()
    .then((result) => {
      console.log(JSON.stringify(result));
      res.redirect("/tasks/allocated-tasks");
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/tasks/my-tasks/update/:taskid/:status", (req, res) => {
  const { taskid, status } = req.params;
  const d = new Date();
  let update_time =
    d.getDate() +
    "-" +
    Number(d.getMonth() + 1) +
    "-" +
    d.getFullYear() +
    " : " +
    d.getHours() +
    ":" +
    d.getMinutes();
  let update = { status: status };
  if (status == "ongoing") {
    update.starting_time = update_time;
    update.completion_time = "";
    update.seen_time = "";
  }
  if (status == "complete") {
    update.completion_time = update_time;
    update.starting_time = "";
    update.seen_time = "";
  }
  if (status == "seen") {
    update.seen_time = update_time;
    update.completion_time = "";
    update.starting_time = "";
  }

  taskModel
    .findByIdAndUpdate(taskid, update)
    .then((result) => {
      req.flash("msg", "Updated Succesfully !");
      res.redirect("/tasks/my-tasks");
    })
    .catch((err) => {
      console.log("err: " + err);
    });
});

module.exports = router;
