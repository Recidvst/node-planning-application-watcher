// filesystem
const fs = require('fs');
const overWriteFile = require('./writeFile.js');
const logToFile = require('./createFile.js');
// require notifications trigger
const sendNotifications = require('./triggerNotifications');
// scraping
const puppeteer = require('puppeteer');
// util
var isDate = require('date-fns/isDate');
var isSameDay = require('date-fns/isSameDay');

// config/env
require('dotenv').config();

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

const scraperFn = async () => {
  if (scrapeURL && scrapeURL !== '' && postcode && postcode !== '') {
    try {

      const browser = await puppeteer.launch({ headless: useHeadless, args: ['--no-sandbox'] });
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
      
      // close puppeteer browser instance
      browser.close();

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
            return false;
          }
          // if dates DO match then update the file date but also trigger notifications to the user and add a success file
          else {
            overWriteFile('./config/config_date.txt', new Date().toISOString());
            logToFile('./logs/successful-match.txt', `A match was found on this date: ${new Date().toISOString()}`);
            // return the result date to be used in the notifications trigger function
            return resultDate;
          }
        }
      }

    }
    catch(err) {
      logToFile('logs/error-log.txt', `Scraper (puppeteer) fn failed to process planning page. Reason: ${err} at: ${new Date().toISOString()}\r\n`); // update error log file
      sendNotifications('error', err);
    }
  }
  else {
    return false;
  }
}

module.exports = scraperFn;
