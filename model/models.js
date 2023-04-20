const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const render_properties = {
  limit: 1,
};
const userModel = mongoose.model(
  "users",
  new Schema({
    name: String,
    email: String,
    sec_email: String,
    password: String,
    designation: String,
    added_by: String,
    role: String,
  })
);

const taskSchema = new Schema({
  task_name: String,
  by_id: String,
  to_id: String,
  to_name: String,
  by_name: String,
  assign_time: String,
  due_time: String,
  seen_time: String,
  starting_time: String,
  completion_time: String,
  status: String,
  detail: String,
});
const taskModel = mongoose.model("tasks", taskSchema);

module.exports = { userModel, taskModel, render_properties };
