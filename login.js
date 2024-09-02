const request = require('request-promise').defaults({ jar: true })
const puppeteer = require('puppeteer')
const cheerio = require('cheerio')

async function main() {
    try {
        const browser = await puppeteer.launch({
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: false
        });
        const page = await browser.newPage();
        await page.goto("https://accounts.craigslist.org/login");
        await page.type("input#inputEmailHandle", "stefanhyltoft@gmail.com");
        await page.type("input#inputPassword", "Fn&ET2Br45!z");
        await page.click("button#login");
        await page.waitForNavigation();
        await page.goto(
            "https://accounts.craigslist.org/login/home?show_tab=billing"
        );
        const content = await page.content();
        const $ = await cheerio.load(content);
        $("body > article > section > fieldset > b").text();
    } catch (erro) {
        console.error(erro);
    }
}

main()
