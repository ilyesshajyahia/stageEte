const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "ilyesshajyahia@gmail.com",
    pass: "ipgmlcxcxsnwvsvl",
  },
});

exports.sendMail = async ({ to, subject, text, html }) => {
  console.log("SENDING EMAIL TO:", to); // <-- important

  const mailOptions = {
    from: "ilyesshajyahia@gmail.com",
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(mailOptions);
};
