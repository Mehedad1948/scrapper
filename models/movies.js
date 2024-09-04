const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
    title: String,
    rating: String,
    link: String,
    year: String,
    image: String,
    description: String,
    genre: [String]
})

const Movie = mongoose.model('movies', movieSchema)

module.exports = Movie