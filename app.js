// get core
const express = require('express');
// get packages
const morgan = require('morgan');
const pretty = require('express-prettify');
const cors = require('cors')
const gnuHeader = require('node-gnu-clacks');

// config/env
require('dotenv').config();

// declare app
const app = express();
const router = express.Router({ mergeParams: true });
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

// error handling?
process.on('uncaughtException', function (err) {
  console.error(err);
  console.error(err.stack);
});

module.exports = app;