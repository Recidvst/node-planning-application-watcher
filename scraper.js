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
const postcode = process.eventNames.TARGETPOSTCODE || false;

const puppeteer = require('puppeteer');

if (scrapeURL && scrapeURL !== '' && postcode && postcode !== '') {

  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // go to page
    await page.goto(scrapeURL, {waitUntil: 'networkidle2'});
    // add postcode search input
    await page.type('#simpleSearchString', postcode);
    // submit form
    await page.click('input[type="submit"]');
    // wait for navigation to results page
    await page.waitForNavigation();
    console.log('New Page URL:', page.url());
    // then update the filters to show 100 items
    await page.select('#resultsPerPage', '100');
    // submit the form to refresh
    await page.click('input[type="submit"]');
    // wait for navigation to the updated page
    await page.waitForNavigation();
    console.log('New Page URL:', page.url());
    // get list of applications
    const results = await page.evaluate(() => Array.from(document.querySelectorAll('#searchresults .searchresult'), element => element.textContent));
    const firstResult = results[0];
    const firstResultDateLocation = firstResult.indexOf('Received');
    const firstResultDate = firstResult.substr(firstResultDateLocation, 16);
    console.log(firstResultDate);
  
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
