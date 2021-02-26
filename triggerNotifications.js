// env vars
const NOTIFYBYEMAIL = (process.env.NOTIFYBYEMAIL === 'true') || false;
// actions
const mailer = require('./mailer');
// require log function
const logToFile = require('./createFile.js');

// config/env
require('dotenv').config();
const scrapeURL = process.env.TARGETURL || '...';

// trigger fn
const sendNotifications = async (date, error = undefined) => {
  try {

    // set wording
    let subject = '';
    let message = '';
    let found = false;

    // if a test to make sure the cron is running
    if (date === 'test') {
      subject = '🏗️👷 This confirms that the planning application cron is firing OK';
      message = `No need to do anything. We are successfully watching ${scrapeURL}.`;
    }
    else if (date === 'error') {
      subject = '🏗️🚨 Something went wrong with the planning application watcher';
      message = `Error: ${error}`; 
    }
    else {
      subject = '🏗️⚠️ A recent planning application has been made in postcode: SN2 1NB';
      message = `Visit <a href="${scrapeURL}" title="Visit the Swindon Borough Council planning page">${scrapeURL}</a> and enter the postcode to view the application in detail`; 
      found = true;
    }
    // send mail
    if (NOTIFYBYEMAIL && mailer && typeof mailer === 'object') {
      mailer.sendMail(subject, message, found);
    }

  }
  catch(err) {
    logToFile('logs/error-log.txt', `Notifications trigger fn failed. Reason: ${err} at: ${new Date().toISOString()}\r\n`); // update error log file
  }
}

module.exports = sendNotifications;