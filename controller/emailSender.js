const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sender_mail = process.env.SENDER_MAIL;
const sender_mail_pass = process.env.SENDER_MAIL_PASS;
//
const sendEmail = async (to_mail, subject, message, mail_text) => {
  console.log("reached ");

  const mailOptions = {
    from: sender_mail,
    to: to_mail,
    subject: subject,
    html:
      "<h4>Please signup using the link in our task management system. </h4><br>" +
      mail_text +
      "<br>" +
      `${message}`,
  };
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: sender_mail,
      pass: sender_mail_pass,
    },
    tls: {
      rejectUnAuthorized: true,
    },
  });

  return await transporter
    .sendMail(mailOptions)
    .then((res) => {
      console.log("res-cshj: " + JSON.stringify(result));
      return res;
    })
    .catch((err) => {
      console.log("err-prj:  " + err);
      return err;
    });
};

module.exports = { sendEmail };
