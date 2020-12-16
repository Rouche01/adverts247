const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Quiz = mongoose.model('Quiz');
const { multerUploads, dataUri } = require('../middlewares/multer');
const requireAuth = require('../middlewares/requireAuth');
const { cloudinaryConfig, uploader } = require('../middlewares/cloudinaryConfig');

router.use(requireAuth);


router.get('/quizzes', async(req, res) => {
    try {
        const quizzes = await Quiz.find();
        const number = quizzes.length;
        res.status(200).send({ quizzes, number });
    } catch(err) {
        res.status(500).send({
            error: 'Unable to retrieve quizzes'
        });
    }
});


router.get('/quiz/:id', async(req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id });
        res.status(200).send({ quiz });
    } catch(err) {
        res.status(500).send({
            error: 'Unable to retrieve quiz'
        });
    }
});



router.post('/quizzes', multerUploads, cloudinaryConfig, async(req, res) => {
    const { question, option1, option2, option3, option4, answer, points} = req.body;
    // res.setHeader('Content-Type', 'application/json')
    if(req.file) {
        const file = dataUri(req).content;
        try {
            const cloudinaryObj = await uploader.upload(file);
            const { secure_url } = cloudinaryObj;
            const options = [ option1, option2, option3, option4 ];

            let quiz;

            if(points) {
                quiz = new Quiz({
                    quizImgUri : secure_url,
                    question,
                    options,
                    answer,
                    points
                })
            } else {
                quiz = new Quiz({
                    quizImgUri : secure_url,
                    question,
                    options,
                    answer,
                })
            }

            try {
                await quiz.save();
                res.status(200).send({
                    message: 'Quiz created successfully'
                })
            } catch(err) {
                res.status(500).send({
                    error
                });
            }

        } catch(err) {
            res.status(401).send(err);
        }
    }

});


router.delete('/quiz/:id', async(req, res) => {
    try {
        const response = await Quiz.findByIdAndDelete({ _id: req.params.id });
        res.status(200).send({
            message: "Quiz deleted successfully",
            quiz: response
        });
    } catch(err) {
        res.status(500).send({
            message: "Unable to delete quiz"
        })
    }
})


module.exports = router;