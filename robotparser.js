const robotParser = require('robots-parser')
const request = require('request-promise')

const robotsUrl = 'https://textfiles.meulie.net/robots.txt'

async function getRobotsText(robotsUrl) {
    const robotTxt = await request.get(robotsUrl)
    const robots = robotParser(robotsUrl, robotTxt)

    return robotTxt
}

getRobotsText(robotsUrl)