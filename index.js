const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const cheerio = require('cheerio');
const fs = require('fs');

async function listing(page) {


    await page.goto('https://greatfalls.craigslist.org/search/trp#search=1~list~0~0', { waitUntil: 'networkidle2' });

    const html = await page.content();

    const $ = cheerio.load(html);

    fs.writeFileSync('./test.html', html);
    const titles = $('.cl-static-search-result');
    const data = []
    let list = titles.each((index, element) => {
        let title = $($(element).find('.title ')[0]).text().trim()
        let link = $($(element).find('a')[0]).attr('href').trim()
        let price = $($(element).find('.price')[0]).text().trim().replace('$', '')
        let location = $($(element).find('.location')[0]).text().trim()
        data.push({ title, link, price, location })
    });

    return data
}

async function jobDescriptions(list, page) {
    let newList = []
    for (var i = 0; i < list.length; i++) {
        if (i === 2) {
            break
        }
        await page.goto(list[i].link)
        const html = await page.content()
        const $ = cheerio.load(html)
        const description = $('#postingbody').text().trim()
        const compensation = $('.remuneration .valu').text().trim()

        const newItem = {
            ...list[i],
            description,
            compensation
        }
        newList.push(newItem)

        await sleep(1000)
    }

    return newList
}

async function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: false,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
    const list = await listing(page)
    const listWithJobDescription = await jobDescriptions(list, page)
    // await browser.close();
    console.log(listWithJobDescription);

}

main();
