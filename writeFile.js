// filesystem
const fs = require('fs');

// write config txt file with date
const writeTxtFile = (filename, content) => {
  fs.writeFile(filename, content, function(err) {
    if(err) {
      // if err, send to logfile
      createFile('logs/error-log.txt', `Backup write task failed. Reason: ${err} at: ${new Date().toISOString()}\r\n`); // update error log file
    }
  });
}

module.exports = writeTxtFile;