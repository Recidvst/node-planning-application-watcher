// get core
const express = require('express');
// filesystem
const fs = require('fs');
// scraping
const requestP = require('request-promise');
const cheerio = require('cheerio');
// middleware
const cors = require('cors')
const morgan = require('morgan')
// util
var isDate = require('date-fns/isDate');

// config/env
require('dotenv').config();

// declare app
const app = express();
const port = ( process.env.NODE_ENV === 'production' ) ? process.env.PORT : 8000;

// middleware
app.use(morgan('combined'))
app.use(cors());

// scrape destination is pulled from a .env file using the key 'TARGETURL'
const scrapeURL = process.env.TARGETURL || false;
const postcode = process.env.TARGETPOSTCODE || false;
const useHeadless = ( process.env.NODE_ENV === 'production' ) ? true : false;

const puppeteer = require('puppeteer');

// function to grab a date from a scraped string
const getDateFromResult = function(scrapeResult) {
  if (!scrapeResult) return false;
  let returnValue = false;
  const strippedRes = scrapeResult.replace(/\s+/g, ''); // remove whitespace from string
  console.log(strippedRes);
  const desiredIndex = strippedRes.indexOf('Received'); // index of the word received, which prefixes the date we want to compare to
  const foundDate = strippedRes.substr(desiredIndex, 16); // the length of a date string in format ''
  if (foundDate && isDate(foundDate)) { // return only if a valid date
    return foundDate;
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
    console.log('New Page URL:', page.url());
    // then update the filters to show 100 items
    page.select('#resultsPerPage', '100');
    // submit the form to refresh
    page.click('input[type="submit"]');
    // wait for navigation to the updated page
    await page.waitForNavigation();
    console.log('New Page URL:', page.url());
    // get list of applications
    const results = await page.evaluate(() => Array.from(document.querySelectorAll('#searchresults .searchresult'), element => element.textContent));
    const firstResult = results[0];
    console.log(firstResult);

    // try and get the date from the scrape
    const resultDate = getDateFromResult(firstResult);
    console.log(resultDate);
  
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
