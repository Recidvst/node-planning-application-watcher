// env vars
const NOTIFYBYEMAIL = (process.env.NOTIFYBYEMAIL === 'true') || false;
// actions
const mailer = require('./mailer');
// require log function
const logToFile = require('./createFile.js');

// trigger fn
const sendNotifications = async (date) => {
  try {

    // set wording
    let subject = '';
    let message = '';
    // if a test to make sure the cron is running
    if (date === 'test') {
      subject = '🏗️👷 This confirms that the planning application cron is firing OK';
      message = 'No need to do anything';
    }
    else {
      subject = '🏗️⚠️ A recent planning application has been made in postcode: SN2 1NB';
      message = 'Visit <a href="https://pa1.swindon.gov.uk/publicaccess/" title="Visit the Swindon Borough Council planning page">https://pa1.swindon.gov.uk/publicaccess/</a> and enter the postcode to view the application in detail'; 
    }
    // send mail
    if (NOTIFYBYEMAIL && mailer && typeof mailer === 'object') {
      mailer.sendMail(subject, message);
    }

  }
  catch(err) {
    logToFile('logs/error-log.txt', `Notifications trigger fn failed. Reason: ${err} at: ${new Date().toISOString()}\r\n`); // update error log file
  }
}

module.exports = sendNotifications;