const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const TriviaSession = mongoose.model('TriviaSession');
const Rider = mongoose.model('Rider');

const requireAuth = require('../middlewares/requireAuth');
router.use(requireAuth);


router.post('/trivia-sessions', async(req, res) => {
    const { userId, totalPoints, questions, answeredCorrectly } = req.body;

    if(!userId || !totalPoints || !questions || !answeredCorrectly) {
        return res.status(400).json({
            status: false,
            message: "You have to provide userId, totalPoints, questions, and answeredCorrectly values"
        });
    }

    const triviaSession = new TriviaSession({
        userId, totalPoints, questions, answeredCorrectly
    });
    
    try {
        const session = await triviaSession.save();
        res.status(200).json({
            status: true,
            message: "The trivia session is created successfully!",
            session
        });
    } catch(err) {
        res.status(500).json({
            status: false,
            message: err.message
        })
    }
});


router.get('/trivia-sessions', async(req, res) => {
    try {
        const triviaSessions = await TriviaSession.find();
        res.status(200).json({
            status: true,
            triviaSessions
        });
    } catch(err) {
        res.status(500).json({
            status: false,
            message: err.message
        })
    }
});


router.get('/rider/:rider_id/trivia-sessions', async(req, res) => {
    const { rider_id } = req.params;
    
    const riderExist = await Rider.findOne({ _id: rider_id });
    if(!riderExist) {
        return res.status(404).json({
            status: false,
            message: "Rider does not exist"
        });
    }
    
    try {
        const triviaSessions = await TriviaSession.find({ userId: rider_id });
        res.status(200).json({
            status: true,
            triviaSessions
        });
    } catch(err) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
})


module.exports = router;