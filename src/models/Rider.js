const mongoose = require('mongoose');


const triviaSessionSchema = new mongoose.Schema({
    totalPoints: Number,
    questions: Number,
    answeredCorrectly: Number
});


const riderSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    triviaSessions: [triviaSessionSchema]
}, { timestamps: true });


mongoose.model('Rider', riderSchema);