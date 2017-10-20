#!/usr/bin/env node

const http = require('http');
const cheerio = require('cheerio');
const insertBreaks = require('./insertBreaks');

const searchTerm = process.argv.slice(2).join(' ').toLowerCase().trim()
  .replace(/[^\w\s\d]/g, '') // Remove any special characters
  .replace(/\s+/g, '+'); // convert spaces to '+' as imdb's search does

const searchUrl = `http://www.imdb.com/find?ref_=nv_sr_fn&q=${searchTerm}&s=all`;

http.request(searchUrl, (response) => {
  let str = '';

  // another chunk of data has been recieved, so append it to `str`
  response.on('data', (chunk) => {
    str += chunk;
  });


  // the whole response has been recieved, so we just print it out here
  response.on('end', () => {
    const $ = cheerio.load(str);
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
}).end();
