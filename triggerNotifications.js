// imports
const fs = require("fs");
// require log function
const logToFile = require('./createFile.js');
// env vars
const NOTIFYBYTEXT = (process.env.NOTIFYBYTEXT === 'true') || false;
const NOTIFYBYEMAIL = (process.env.NOTIFYBYEMAIL === 'true') || false;
// actions
const twilio = require('./twilio');
const mailer = require('./mailer');

// fired on cron run
const triggerFn = async (date) => {
  try {
    // options to be passed to send methods
    let sendProto = {
      name: 'Planning Application',
      datefound: date || false,
    }

    // send mail
    if (NOTIFYBYEMAIL && mailer && typeof mailer === 'object') {
      mailer.sendMail(sendOpts);
    }
    // twilio messaging integration
    if (NOTIFYBYTEXT && twilio && typeof twilio === 'object') {
      twilio.twilioSendSMS(sendOpts);
    }

  }
  catch(err) {
    logToFile('logs/error-log.txt', `Crons trigger fn failsd. Reason: ${err} at: ${new Date().toISOString()}\r\n`); // update error log file
  }
}

module.exports = triggerFn;
