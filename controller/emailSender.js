const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sendEmail = async (email, subject, message) => {
  const mailOptions = {
    from: process.env.SENDER,
    to: email,
    subject: subject,
    html:
      "<h4>Please signup using the link in our task management system. <br></h4>" +
      `${message}`,
  };
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SENDER,
      pass: process.env.PASS,
    },
    tls: {
      rejectUnAuthorized: true,
    },
  });

  return await transporter
    .sendMail(mailOptions)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
};

module.exports = { sendEmail };
