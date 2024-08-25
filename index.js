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
    const newList = [];
    for (var i = 0; i < list.length; i++) {
        if (i === 2) {
            break
        }
        await page.goto(list[i].link);
        sleep(1000)

        const description = await page.evaluate(() => {
            const scriptTag = document.querySelector('script[type="application/ld+json"]#ld_posting_data');
            if (scriptTag) {
                const jsonData = JSON.parse(scriptTag.innerText);
                return jsonData.description || 'No description available';
            } else {
                return 'No JSON-LD script found';
            }
        });

        // Clean the HTML tags from the description if needed
        const cleanDescription = await page.evaluate(description => {
            const div = document.createElement('div');
            div.innerHTML = description;
            return div.innerText;
        }, description);

        // Add the clean description to the corresponding item in the list
        const newItem = {
            ...list[i], // Spread the existing properties of the list item
            description: cleanDescription.trim() // Add the description field
        };

        // Add the new item to the newList
        newList.push(newItem);
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
