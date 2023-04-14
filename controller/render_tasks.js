const { userModel, taskModel } = require("../model/user");

function render_my_tasks(req, res) {
  taskModel
    .find({})
    .sort({ $natural: -1 })
    .limit(10)
    .then((tasks) => {
      console.log("tasks: " + JSON.stringify(tasks));
      res.render("given_tasks", {
        authstatus: "logged-in",
        user: req.user,
        tasks: tasks,
      });
    })
    .catch((err) => {
      res.send("err: find: " + err);
    });
}
function render_given_tasks(req, res) {
  console.log("id:  " + req.user.id);
  taskModel
    .find({ by: req.user.id })
    .sort({ $natural: -1 })
    .limit(10)
    .then((tasks) => {
      console.log("tasks: " + JSON.stringify(tasks));
      res.render("given_tasks_flex", {
        auth_status: "logged-in",
        name: req.user.name,
        role: req.user.role,
        designation: req.user.designation,
        role: req.user.role,
        tasks: tasks,
      });
    })
    .catch((err) => {
      res.send("err: find: " + err);
    });
}

module.exports = { render_my_tasks, render_given_tasks };
