// cron tasks
const cron = require("node-cron");
const triggerFn = require('./triggerScrape');

// require log function
const logToFile = require('./createFile.js');

// check cron schedule validity
const validator = (schedule) => {
  return new Promise ((resolve, reject) => {
    if (typeof schedule === undefined) reject('Must pass a cron schedule');
    const valid = cron.validate(schedule);
    if (valid) {
      resolve();
    }
    else {
      reject('Invalid cron schedule (' + schedule + ')');
    }
  });
}

// schedule tasks to be run on the server
// daily job running at 4pm
const dailyCron = () => {
  const sched = "0 16 * * *";
  validator(sched)
  .then( () => { // if cron valid
    cron.schedule(sched, function() {
      triggerFn();
      logToFile('logs/cron-log.txt', `Cron 'dailyCron' ran at: ${new Date().toISOString()}\r\n`); // update log file
    });
  })
  .catch( (err) => {
    logToFile('logs/error-log.txt', `Process terminated. Reason: ${err} at: ${new Date().toISOString()}\r\n`); // update error log file
    // kill process
    process.exit(9);
  })
}
// weekly job running on Saturdays at 4pm
const weeklyCron = () => {
  const sched = "0 16 * * 6";
  validator(sched)
  .then( () => { // if cron valid
    cron.schedule(sched, function() {
      triggerFn();
      logToFile('logs/cron-log.txt', `Cron 'weeklyCron' ran at: ${new Date().toISOString()}\r\n`); // update log file
    });
  })
  .catch( (err) => {
    logToFile('logs/error-log.txt', `Process terminated. Reason: ${err} at: ${new Date().toISOString()}\r\n`); // update error log file
    // kill process
    process.exit(9);
  })
}
// monthly job running at 9am to test that the cron is still running
const monthlyCron = () => { 
  const sched = "0 16 1 * *";
  validator(sched)
  .then( () => { // if cron valid
    cron.schedule(sched, function() {
      triggerFn('test');
      logToFile('logs/cron-log.txt', `Cron 'monthlyCron' ran at: ${new Date().toISOString()}\r\n`); // update log file
    });
  })
  .catch( (err) => {
    logToFile('logs/error-log.txt', `Process terminated. Reason: ${err} at: ${new Date().toISOString()}\r\n`); // update error log file
    // kill process
    process.exit(9);
  })
}

const testErrorCron = () => { // schedule validation tester
  const sched = "*/10 * asds* '* *//1 *";
  validator(sched)
  .then( () => { // if cron valid
    cron.schedule(sched, function() {
      logToFile('logs/cron-log.txt', `Cron 'testErrorCron' ran at: ${new Date().toISOString()}\r\n`); // update log file
    });
  })
  .catch( (err) => {
    logToFile('logs/error-log.txt', `Process terminated. Reason: ${err} at: ${new Date().toISOString()}\r\n`); // update error log file
    // kill process
    process.exit(9);
  })
}

module.exports = {
  weeklyCron,
  dailyCron,
  monthlyCron,
  testErrorCron
};
