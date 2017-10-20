#!/usr/bin/env node

const http = require('http');
const cheerio = require('cheerio');

const searchTerm = process.argv.slice(2).join(' ').toLowerCase().trim()
  .replace(/[^\w\s\d]/g, '') // Remove any special characters
  .replace(/\s+/g, '+'); // convert spaces to '+' as imdb's search does

const searchUrl = `http://www.imdb.com/find?ref_=nv_sr_fn&q=${searchTerm}&s=all`;

/**
* Inserts line breaks between each film and removes any alternate titles
* @param {string} movieTitlesString
* @returns {string}
*/
const insertBreaks = (movieTitlesString) => {
  const betweenEach = /\)\s+([^(\s])/g;
  const removeAkas = /aka ".+"\s*/g;
  return movieTitlesString.replace(betweenEach, ')\n$1').replace(removeAkas, '');
};

const printMovies = (response) => {
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
};


http.request(searchUrl, printMovies).end();

/* tangentially related question:
* how do you run the program with the
* optional arguments referred to by
* process.argv0 (distinct from process.argv[0])
*/
// console.log(`special argv0: ${process.argv0} \n0:${process.argv[0]} \n1: ${process.argv[1]}`)
