const { userModel, taskModel, render_properties } = require("../model/models");

function render_tasks(req, res, filter, render_what) {
  const { pagenumb } = req.query;
  let skip = 0;
  if (pagenumb) {
    skip = render_properties.limit * pagenumb - render_properties.limit;
  }
  taskModel
    .find(filter)
    .sort({ $natural: -1 })
    .limit(render_properties.limit)
    .skip(skip)
    .then((tasks) => {
      taskModel
        .count(filter)
        .then((count) => {
          msg = count == 0 ? "No Data In System" : req.flash("msg");

          res.render("page_allocated_tasks", {
            auth_status: "logged-in",
            name: req.user.name,
            role: req.user.role,
            designation: req.user.designation,
            role: req.user.role,
            tasks: tasks,
            data_title: req.flash("data_title"),
            render_what,
            msg,
            count,
            skip,
            limit: render_properties.limit,
          });
        })
        .catch((err) => {});
    })
    .catch((err) => {
      res.send("err: find: " + err);
    });
}

function render_assigned_tasks(req, res, filter) {
  const { pagenumb } = req.query;
  let skip = 0;
  if (pagenumb) {
    skip = render_properties.limit * pagenumb - render_properties.limit;
  }
  taskModel
    .find(filter)
    .sort({ $natural: -1 })
    .limit(render_properties.limit)
    .skip(skip)
    .then((tasks) => {
      taskModel
        .count(filter)
        .then((count) => {
          //
          msg = count == 0 ? "No Data In System" : req.flash("msg");
          res.render("page_allocated_tasks", {
            auth_status: "logged-in",
            name: req.user.name,
            role: req.user.role,
            designation: req.user.designation,
            role: req.user.role,
            tasks: tasks,
            render_what: "allocated-tasks",
            data_title: req.flash("data_title") + tasks[0].team_member_name,
            msg,
            count,
            skip,
            limit: render_properties.limit,
          });
        })
        .catch((err) => {
          console.log("err quota .. . . . ");
        });
    })
    .catch((err) => {
      res.send("err: find: " + err);
    });
}

module.exports = { render_tasks, render_assigned_tasks };
