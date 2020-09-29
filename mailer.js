// require log function
const logToFile = require('./createFile.js');

// env vars
const MAILUSR = process.env.GMAILACCOUNT || false;
const MAILPWD = process.env.GMAILPASSWORD || false;

let nodemailer = require("nodemailer");

const sendMail = function(opts) {

  // message wording
  const subject = '🏗️ A recent planning application has been made in postcode: SN2 1NB';
  const eventWording = 'Visit <a href="https://pa1.swindon.gov.uk/publicaccess/" title="Visit the Swindon Borough Council planning page">https://pa1.swindon.gov.uk/publicaccess/</a> and enter the postcode to view the application in detail';

  if (eventWording) {
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
    let message = {
      from: `Event Reminder<${MAILUSR}>`,
      to: `<${MAILUSR}>`,
      subject: `${subject}`,
      text: eventWording,
      html: `<p>${eventWording}</p>`
    };

    mailer.sendMail(message, (err, info) => {
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
