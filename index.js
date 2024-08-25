const request = require('request-promise')
const cheerio = require('cheerio')
const fs = require('fs')

async function main(params) {
    const html = await request.get('https://www.carpetdepo.eu/iranian-carpets')
    fs.writeFileSync('./test.html', html)
    const $ = await cheerio.load(html)
   const title =  $('title').text()
   $('h2').each((index, element)=> {
    console.log($(element).text());
    
   })
   
}

main()