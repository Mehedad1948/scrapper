const puppeteer = require('puppeteer')

async function main() {
    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: false });

    const page = await browser.newPage()
    await page.goto('https://pptr.dev/guides/configuration')
}


main()