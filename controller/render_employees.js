const { userModel, taskModel, render_properties } = require("../model/models");

function render_employees(req, res, filter, render_what) {
  //
  const { pagenumb } = req.query;
  let skip = 0;
  if (pagenumb) {
    skip = render_properties.limit * pagenumb - render_properties.limit;
  }
  const { name, email, role, designation } = req.user;
  userModel
    .find(filter)
    .sort({ $natural: -1 })
    .limit(render_properties.limit)
    .skip(skip)
    .then((employees) => {
      userModel
        .count(filter)
        .then((count) => {
          console.log("count: " + count);
          let msg = count == 0 ? "No Data In System" : req.flash("msg");
          res.render("page_employees", {
            auth_status: "logged-in",
            name,
            role,
            designation,
            email,
            data: employees,
            data_title: req.flash("data_title"),
            render_what,
            msg,
            count,
            skip,
            limit: render_properties.limit,
          });
        })
        .catch((err1) => {
          console.log("err:  " + JSON.stringify(err1));
        });
    })
    .catch((err2) => {
      res.send("err: find: " + err2);
    });
}
module.exports = { render_employees };
