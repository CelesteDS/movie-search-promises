const http = require('http')
const cheerio = require('cheerio')

const searchTerm = process.argv.slice(2).join(' ').toLowerCase().trim()
  .replace(/[^\w\s\d]/g, '')
  .replace(/\s+/g, '+')

const options = {
  hostname: 'www.imdb.com',
  path: `/find?ref_=nv_sr_fn&q=${searchTerm}&s=all`,
}
const callback = (response) => {
  let str = ''

  // another chunk of data has been recieved, so append it to `str`
  response.on('data', (chunk) => {
    str += chunk
  })

  // the whole response has been recieved, so we just print it out here
  response.on('end', () => {
    const $ = cheerio.load(str)
    let theText = ''
    $('.findList').each((i, elem) => {
      theText += $('.result_text', elem).text()
      return false
    })
    $('.result_text').children('small').each((ind, elem) => {
      theText = theText.replace($(elem).text(), '')
    })
    console.log(insertBreaks(theText.trim()))
  })
}

http.request(options, callback).end()

/**
* Inserts line breaks between each film
* @param {string} movieTitlesString
* @returns {string}
*/
const insertBreaks = (movieTitlesString) => {
  const betweenEach = /\)\s+([^(\s])/g
  const removeAkas = /aka ".+"\s*/g
  return movieTitlesString.replace(betweenEach, ')\n$1').replace(removeAkas, '')
}
