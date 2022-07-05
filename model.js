const mongoose = require('mongoose');

const JobListSchema = new mongoose.Schema({
    title: {
        required: false,
        type: String,
    },
    company: {
        required: false,
        type: String,
    },
    technologies: {
        required: false,
        type: [String]
    }
})

module.exports = mongoose.model('JobList', JobListSchema)