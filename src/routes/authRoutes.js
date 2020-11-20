const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.post('/drivers/signup', async (req, res) => {
    const { 
        email,
        name,
        phoneNumber,
        password,
        city,
        inviteCode
    } = req.body;

    if( !email || !name || !phoneNumber || !password || !city ) {
        return res.status(422).send({ error: "You are not entering all the data required to sign up."})
    }

    const user = new User({
        email,
        name,
        phoneNumber,
        password,
        city,
        role: "driver"
    });

    try {
        await user.save();
        const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET_KEY);
        res.status(200).send({
            message: 'successfully registered!',
            token
        });
    } catch(err) {
        res.status(400).send({
            error: `unable to register, ${err}`
        })
    }

});


router.post('/drivers/signin', async(req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(400).json({
            status: 'error',
            message: "You have to provide both email and password."
        });
    }

    const user = await User.findOne({ email });

    if(!user || user.role !== 'driver') {
        return res.status(400).json({
            status: 'error',
            message: "You are logging with wrong credentials"
        });
    }

    try {
        await user.comparePassword(password);
        const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET_KEY);
        res.status(200).send({
            message: 'User signed in successfully.',
            token
        })
    } catch(err) {
        return res.status(400).json({
            status: 'error',
            message: `You are logging with wrong credentials`
        })
    }
})


module.exports = router;