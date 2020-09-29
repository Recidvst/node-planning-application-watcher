// env vars
const accountSid = process.env.TWILIOACCOUNT || false;
const authToken = process.env.TWILIOTOKEN || false;
const receiverNumber = process.env.TWILIORECEIVERNUMBER || false;
const smsSenderNumber = process.env.TWILIOSENDERSMS || false;

// twilio pkg
const client = require('twilio')(accountSid, authToken);

// require log function
const logToFile = require('./createFile.js');

// SMS
const twilioSendSMS = function(opts) {

  // message wording
  const subject = '🏗️ A recent planning application has been made in postcode: SN2 1NB. Visit https://pa1.swindon.gov.uk/publicaccess/ and enter the postcode to view the application in detail';

  if (message) {
    if (accountSid && authToken && smsSenderNumber && receiverNumber) { // all vars present?
      // send msg
      client.messages
        .create({
          body: subject,
          from: `${smsSenderNumber}`,
          to: `${receiverNumber}`
        })
        .then( (response) => {
          if (response.errorCode) {
            logToFile('logs/twilio-log.txt', `SMS Message with sid (${response.sid}) FAILED to send to ${masked} at: ${new Date().toISOString()}\r\n`); // update log file
          }
          else {
            let masked = receiverNumber.substr(0, receiverNumber.length - 5) + '*****';
            logToFile('logs/twilio-log.txt', `SMS message with sid (${response.sid}) sent to ${masked} at: ${new Date().toISOString()}\r\n`); // update log file
          }
        })
        .done();
    }
  }
}

module.exports = {
  twilioSendWhatsApp,
  twilioSendSMS
};
