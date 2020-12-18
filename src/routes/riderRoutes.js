const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');

const Rider = mongoose.model('Rider');


router.post('/riders', requireAuth, async(req, res) => {
    const { fullname, email, phoneNumber, triviaSessions } = req.body;

    if(!fullname || !email || !phoneNumber) {
        return res.status(400).json({
            status: false,
            message: 'You are not entering the required data'
        });
    }

    const rider = new Rider({
        fullname,
        email,
        phoneNumber,
        triviaSessions
    });

    try {
        await rider.save();
        res.status(200).json({
            status: true,
            message: "New rider registered successfully!"
        })
    } catch(err) {
        res.status(500).json({
            status: false,
            message: err.message
        })
    }
});


router.get('/riders', requireAuth, async(req, res) => {
    try {
        const riders = await Rider.find();
        const number = riders.length;
        res.status(200).json({
            status: true,
            riders,
            number
        });
    } catch(err) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
});


router.get('/rider/:rider_email', async(req, res) => {
    const { rider_email } = req.params;

    try {
        const riderExist = await Rider.findOne({ email: rider_email });
        if(!riderExist) {
            return res.status(200).json({
                existStatus: false,
                message: "This rider does not exist"
            });
        }
        res.status(200).json({
            existStatus: true,
            rider: riderExist
        });
    } catch(err) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
});


router.delete('/rider/:rider_id', async(req, res) => {
    const { rider_id } = req.params;

    try {
        const riderExist = await Rider.findOne({ _id: rider_id });
        if(!riderExist) {
            return res.status(404).json({
                status: false,
                message: "This rider does not exist"
            });
        }
        await Rider.deleteOne({ _id: rider_id });
        res.status(200).json({
            status: true,
            message: "Rider deleted successfully",
            deletedRider: riderExist
        });
    } catch(err) {
        res.status(500).json({
            status: false,
            message: err.message
        })
    }
});


router.patch('/rider/:rider_id', async(req, res) => {
    const { phoneNumber, fullname, triviaSessions } = req.body;

    if(!phoneNumber && !fullname && !triviaSessions) {
        return res.status(400).json({
          status: false,
          message: err.message  
        });
    }

    const riderExist = await Rider.findOne({ _id: req.params.rider_id });
    if(!riderExist) {
        return res.status(404).json({
            status: false,
            message: "Rider does not exist"
        });
    }

    let newValues = { $set: { } };
    const updatables = { phoneNumber, fullname, triviaSessions };

    for (key in updatables) {
        if(updatables[key]) {
            newValues.$set[key] = updatables[key];
        }
    }

    try {
        const response = await Rider.updateOne({ _id: req.params.rider_id }, newValues);
        res.status(200).json({
            status: true,
            message: "Rider updated successfully",
            data: response
        });
    } catch(err) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }


});


module.exports = router;