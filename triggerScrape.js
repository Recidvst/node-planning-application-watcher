// require log function
const logToFile = require('./createFile.js');
// require scraper fn
const scraperFn = require('./scraper.js');
// require notifications trigger
const sendNotifications = require('./triggerNotifications');

// fired on cron run
const triggerFn = async (isTest) => {
  try {

    // if a test to make sure the cron is running
    if (isTest && isTest === 'test' ) {
      sendNotifications('test');
      return false;
    }
    // else do logic
    else {
      const matchedDate = await scraperFn();
      // if match found then new planning application has been made so trigger notifications
      if (matchedDate) {
        sendNotifications(matchedDate);
        return true;
      }
      return false;
    }

  }
  catch(err) {
    logToFile('logs/error-log.txt', `Scraper trigger fn failed. Reason: ${err} at: ${new Date().toISOString()}\r\n`); // update error log file
  }
}

module.exports = triggerFn;
