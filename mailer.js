// require log function
const logToFile = require('./createFile.js');

// env vars
const MAILUSR = process.env.GMAILACCOUNT || false;
const MAILPWD = process.env.GMAILPASSWORD || false;
const CCEMAIL = process.env.CCEMAIL || false;

let nodemailer = require("nodemailer");

const sendMail = function(subject, message, found = false) {
  if (subject && message) {
    // Create a SMTP transporter object
    let mailer = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: 'Yes',
      auth: {
        user: MAILUSR,
        pass: MAILPWD
      },
      debug: true, // show debug output
    });

    // Message object
    let emailMessage = {
      from: `Planning Application Watcher<${MAILUSR}>`,
      to: `${MAILUSR}`,
      subject: `${subject}`,
      text: message,
      html: `<p>${message}</p>`
    };
    
    if (found && CCEMAIL && CCEMAIL !== '') {
      emailMessage.cc = `${CCEMAIL}`;
    }

    mailer.sendMail(emailMessage, (err, info) => {
      if (err) {
        logToFile('logs/error-log.txt', `Nodemailer send failed. Reason: ${err.message} at: ${new Date().toISOString()}\r\n`); // update error log file
        return process.exit(1);
      }

    });
  }

}

module.exports = {
  sendMail
};
