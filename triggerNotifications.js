// env vars
const NOTIFYBYEMAIL = (process.env.NOTIFYBYEMAIL === 'true') || false;
// actions
const mailer = require('./mailer');
// require log function
const logToFile = require('./createFile.js');

// trigger fn
const sendNotifications = async (date) => {
  try {

    // send mail
    if (NOTIFYBYEMAIL && mailer && typeof mailer === 'object') {
      mailer.sendMail();
    }

  }
  catch(err) {
    logToFile('logs/error-log.txt', `Notifications trigger fn failed. Reason: ${err} at: ${new Date().toISOString()}\r\n`); // update error log file
  }
}

module.exports = sendNotifications;