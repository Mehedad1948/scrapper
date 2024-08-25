const request = require('request-promise')
const cheerio = require('cheerio')
const fs = require('fs')

async function main(params) {
    const html = await request.get('https://www.javatpoint.com/html-table')
    fs.writeFileSync('./test.html', html)
    const $ = await cheerio.load(html)
    const title = $('title').text()

    $('table tr').each((index, element) => {
        const tds = $(element).find('td')
        const content = $(tds[0]).text()
        console.log('🔥', content);
    });


}

main()