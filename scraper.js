// get core
const express = require('express');
// filesystem
const fs = require('fs');
const overWriteFile = require('./writeFile.js');
const logToFile = require('./createFile.js');

// scraping
const puppeteer = require('puppeteer');
// middleware
const cors = require('cors')
const morgan = require('morgan')
// util
var isDate = require('date-fns/isDate');
var isSameDay = require('date-fns/isSameDay');

// config/env
require('dotenv').config();

// declare app
const app = express();

// middleware
app.use(morgan('combined'))
app.use(cors());

// scrape destination is pulled from a .env file using the key 'TARGETURL'
const scrapeURL = process.env.TARGETURL || false;
const postcode = process.env.TARGETPOSTCODE || false;
const useHeadless = ( process.env.NODE_ENV === 'production' ) ? true : false;

// function to grab a date from a scraped string
const getDateFromResult = function(scrapeResult) {
  if (!scrapeResult) return false;
  let returnValue = false;
  const strippedRes = scrapeResult.replace(/ +(?= )/g,'').replace(/\n|\r/g, ''); // remove double whitespaces from string to clean it up
  const foundDate = strippedRes.substr(strippedRes.indexOf('Received') + 10, 15); // index of the word received, which prefixes the date we want to compare to + the length of a date string in format 'Mon 01 Jan 1970'
  const parsedDate = new Date(foundDate);
  // is date valid?
  if (parsedDate && isDate(parsedDate)) {
    return parsedDate;
  }
  return returnValue;
}

if (scrapeURL && scrapeURL !== '' && postcode && postcode !== '') {

  (async () => {
    const browser = await puppeteer.launch({ headless: useHeadless });
    const page = await browser.newPage();
    // go to page
    await page.goto(scrapeURL, {waitUntil: 'networkidle2'});
    // add postcode search input
    await page.type('#simpleSearchString', postcode);
    // submit form
    page.click('input[type="submit"]');
    // wait for navigation to results page
    await page.waitForNavigation();
    // then update the filters to show 100 items
    page.select('#resultsPerPage', '100');
    // submit the form to refresh
    page.click('input[type="submit"]');
    // wait for navigation to the updated page
    await page.waitForNavigation();
    // get list of applications
    const results = await page.evaluate(() => Array.from(document.querySelectorAll('#searchresults .searchresult'), element => element.textContent));
    const firstResult = results[0];

    // try and get the date from the scrape
    const resultDate = getDateFromResult(firstResult);

    // if date valid then compare to current date 
    if (resultDate) {
      // read date txt contents
      const fileDate = fs.readFileSync('./config/config_date.txt', (err, data) => {
        if (err) {
          return false;
        };
        return data;
      });
      
      // if date scraped, check that if it is the same day as the one on file
      if (fileDate !== '' && fileDate !== false) {
        // if dates don't match, do nothing except update the file date to today (overwrite)
        if (!isSameDay(new Date(fileDate), resultDate)) {
          overWriteFile('./config/config_date.txt', new Date().toISOString());
        }
        // if dates DO match then update the file date but also trigger notifications to the user and add a success file
        else {
          overWriteFile('./config/config_date.txt', new Date().toISOString());
          logToFile('./logs/successful-match.txt', new Date().toISOString());
          // TODO: add notifications functionality
        }
      }
    }
  
    // close puppeteer browser instance
    await browser.close();
  })();

  console.log('working...');
}

// error handling?
process.on('uncaughtException', function (err) {
  console.error(err);
  console.error(err.stack);
});

module.exports = app;
