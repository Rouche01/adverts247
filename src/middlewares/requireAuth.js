const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');
require('dotenv').config();


module.exports = async(req, res, next) => {
    const { authorization } = req.headers;

    if(!authorization) {
        return res.status(401).send({
            error: "You need to be logged in to access this resources"
        });
    }

    const token = authorization.replace('Bearer ', '');

    jwt.verify(token, process.env.TOKEN_SECRET_KEY, async(err, payload) => {
        if(err) {
            return res.status(401).send({
                error: "You need to be logged in to access this resources"
            });
        }

        const user = await User.findById(payload.userId);
        req.user = user;
        next();
    });

    
}