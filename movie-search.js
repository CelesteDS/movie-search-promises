#!/usr/bin/env node

const rp = require('request-promise');
const cheerio = require('cheerio');
const insertBreaks = require('./insertBreaks');

const searchTerm = process.argv.slice(2).join(' ').toLowerCase().trim()
  .replace(/[^\w\s\d]/g, '') // Remove any special characters
  .replace(/\s+/g, '+'); // convert spaces to '+' as imdb's search does

const searchUrl = `http://www.imdb.com/find?ref_=nv_sr_fn&q=${searchTerm}&s=all`;

rp(searchUrl).then((htmlString) => {
  const $ = cheerio.load(htmlString);
  let theText = '';
  $('.findList').each((i, elem) => {
    if ($('h3', $(elem).parent()).text() === 'Titles') {
      theText += $('.result_text', elem).text();
      return false;
    }
    return true;
  });
  $('.result_text').children('small').each((ind, elem) => {
    theText = theText.replace($(elem).text(), '');
  });
  console.log(insertBreaks(theText).trim());
});
