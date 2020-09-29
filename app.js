// get core
const express = require('express');
// get packages
const morgan = require('morgan');
const pretty = require('express-prettify');
const cors = require('cors')
const gnuHeader = require('node-gnu-clacks');
const logToFile = require('./createFile.js');

// config/env
require('dotenv').config();

// import crons
const crons = require('./crons');

// declare app
const app = express();
const port = (process.env.NODE_ENV === 'production') ? process.env.PORT : 3001;

// middleware
app.use(morgan('combined'))
app.use(cors());
app.use(pretty({ always: true, spaces: 2 }));
app.use(gnuHeader());

// set the server listening
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// call crons
if (crons && typeof crons === 'object') {
  crons.dailyCron();
}
else {
  server.close(() => {
    logToFile('logs/error-log.txt', `Crons not found. Process terminated at: ${new Date().toISOString()}\r\n`); // update error log file
    process.exit(9);
  })
}

// error handling?
process.on('uncaughtException', function (err) {
  console.error(err);
  console.error(err.stack);
});

module.exports = app;