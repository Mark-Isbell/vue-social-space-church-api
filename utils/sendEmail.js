const nodemailer = require("nodemailer");
const devLog = require("../utils/devLog");

const sendEmail = async options => {
  devLog("sendEmail util block entered");

  let transporter = null;

  if (process.env.NODE_ENV === "dev") 
      {
        transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.SMTP_EMAIL,
             pass: process.env.SMTP_PASSWORD
           }
        });
      }
      else       {
        transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.SMTP_EMAIL,
             pass: process.env.SMTP_PASSWORD
           }
        });
      }

  // note that nodemailer has some other examples to use for the
  // sections in this js file.  The boilerplate for this file is
  // from their site
  devLog("from this email: " + JSON.stringify(process.env.FROM_EMAIL))
  const message = {
    from: `${process.env.FROM_EMAIL}`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  const info = await transporter.sendMail(message); 

  devLog("info : " + JSON.stringify(info)); 
  return info; 
};

module.exports = sendEmail;
