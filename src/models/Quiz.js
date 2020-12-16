const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    quizImgUri: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 2
    }
}, { timestamps: true });


mongoose.model('Quiz', quizSchema);