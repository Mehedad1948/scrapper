const mongoose = require('mongoose')

const listingSchema = new mongoose.Schema({
    title: String,
    datePosted: Date,
    neighborhood: String,
    url: String,
    jobDescription: String,
    compensation: String
})

const Listing = mongoose.model('Listings', listingSchema)

module.exports = Listing