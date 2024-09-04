const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const request = require('request-promise')
const RegularRequest = require('request')

puppeteer.use(StealthPlugin());

const mongoose = require('mongoose')
const Listing = require('./models/Listing')


const cheerio = require('cheerio');
const fs = require('fs');
const { timeout } = require('puppeteer');
const Movie = require('./models/movies');

async function connectToMongoose() {
    await mongoose.connect(`mongodb+srv://scram:ChJRinDOvo6elnZB@cluster0.divun.mongodb.net/`)
    console.log('🚀 Connected to mogoDB',);
}

async function listing(page) {
    await page.goto('https://www.imdb.com/chart/moviemeter/', { waitUntil: 'networkidle2' });

    const html = await page.content();

    const $ = cheerio.load(html);

    fs.writeFileSync('./test.html', html);
    const movieBlocks = $('.ipc-metadata-list-summary-item');
    const data = []
    let list = movieBlocks.each((index, element) => {
        const title = $(element).find('.ipc-title__text').text()
        const rating = $(element).find('.ipc-rating-star--rating').text()
        const link = `https://www.imdb.com` + $(element).find('.ipc-title-link-wrapper').attr('href')
        const year = $(element).find('.cli-title-metadata span:first').text();

        data.push({ title, rating, link, year })
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
        console.time('mongo')
        // const listingModel = new Listing(newItem)
        // await listingModel.save()
        console.timeEnd('mongo')

    }

    return newList
}

async function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
    await connectToMongoose()
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: false,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
    const list = await listing(page)
    const moviesWithImage = await scrapePosterUrl(list.slice(0, 20), page)
    console.log(moviesWithImage);

    await browser.close();

}

async function scrapePosterUrl(movies) {
    const newMovies = []
    for (const movie of movies) {
        try {
            console.log('🔥🔥🔥', movie.link);

            // await page.goto(movie.link, { waitUntil: 'domcontentloaded' }); // Ensure the page is fully loaded

            const html = await request.get(movie.link);

            const $ = cheerio.load(html);

            const imagePageUrl = $('.sc-491663c0-5.cTxZkd > div.sc-491663c0-7.dUfBfF > div > a').attr('href')
            const description = $('section > p > span.sc-2d37a7c7-0.ftDfUj').text()
            const genre = []
            $('.ipc-chip__text').each((i, element) => {
                const genreText = $(element).text()
                genre.push(genreText)
            })

            htmlImage = await request.get(`https://www.imdb.com` + imagePageUrl);

            const image$ = cheerio.load(htmlImage);

            const imageUrl = image$('div.sc-c7067688-0.kTCNvh.media-viewer > div:nth-child(4) > img').attr('src')

            const newMovieItem = { ...movie, image: imageUrl, description, genre }

            imageUrl && newMovies.push(newMovieItem)
            savePosters(imageUrl, movie.title)

            const existingMovie = await Movie.findOne({ link: newMovieItem.link });
            if (existingMovie) {
                // Movie exists, check if it needs a description update
                if (!existingMovie.description || existingMovie?.description?.trim() === "") {
                    existingMovie.description = newMovieItem.description;
                    existingMovie.genre = newMovieItem.genre;
                    await existingMovie.save();
                    console.log(`Updated: ${newMovieItem.title} with new description.`);
                } else {
                    console.log(`Skipped: ${newMovieItem.title} (description already exists).`);
                }
            } else {
                // The movie does not exist, save it as a new movie
                const movieModel = new Movie(newMovieItem);
                await movieModel.save();
                console.log(`Saved: ${newMovieItem.title}`);
            }
            await sleep(1000); // Proper async sleep
        } catch (error) {
            console.log('❌❌❌', movie.title, error);
        }
    }
    return newMovies
}

async function savePosters(imageUrl, title) {
    RegularRequest.get(imageUrl).pipe(fs.createWriteStream(`posters/${title.replaceAll(' ', '-').toLowerCase()}.jpg`))
}
main();

// ChJRinDOvo6elnZB