const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const requireAuth = require('../middlewares/requireAuth');


// @route get /driver
// @desc Get a user with the token sent along the request
// @access Private
router.get('/driver', requireAuth, (req, res) => {
    const user = req.user;
    if(!user) {
        return res.status(404).json({
            error: 'User does not exist'
        })
    }
    res.status(200).send({
        user
    })
})


// @route get /drivers
// @desc Get all users 
// @access Public
router.get('/drivers', async(req, res) => {
    try {
        const users = await User.find({role: 'driver'});
        res.status(200).send({
            users
        });
    } catch(err) {
        res.status(400).json({
            error: 'There was an error retrieving the users'
        })
    }
})


// @route patch /drivers/:id
// @desc update a user's details
// @access Private
router.patch('/drivers/:id', requireAuth, async(req, res) => {
    const { profilePhoto, driversLicense, insuranceCert, vehicleReg } = req.body;
    if(!profilePhoto && !driversLicense && !insuranceCert && !vehicleReg) {
        return res.status(400).send({
            error: 'No update was sent'
        })
    }

    const user = await User.findOne({_id: req.params.id});

    if(!user) {
        return res.status(404).send({
            error: 'User does not exist.'
        })
    }

    let newValues = { $set: { } };

    if(profilePhoto) {
        newValues.$set.profilePhoto = profilePhoto;
    }

    if(driversLicense) {
        newValues.$set.driversLicense = driversLicense;
    }

    if(insuranceCert) {
        newValues.$set.insuranceCert = insuranceCert;
    }

    if(vehicleReg) {
        newValues.$set.vehicleReg = vehicleReg;
    }

    try {
        const response = await User.updateOne({_id: user._id}, newValues);
        res.status(200).send({
            message: 'User updated successfully',
            data: response
        })
    } catch(err) {
        res.status(400).send({
            error: 'Unable to update the user'
        })
    }
})


module.exports = router;
