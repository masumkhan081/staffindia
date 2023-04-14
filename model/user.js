const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const obj = {
  limit:10,
}
const userModel = mongoose.model(
  "users",
  new Schema({
    name: String,
    email: String,
    password: String,
    designation: String,
    role: String,
  })
);

const taskSchema = new Schema({
  taskname: String,
  by: String,
  to: String,
  date: String,
  duedate: String,
  status: Boolean,
  detail: String,
});
const taskModel = mongoose.model("tasks", taskSchema);

module.exports = { userModel, taskModel ,obj};
