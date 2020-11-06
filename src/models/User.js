const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema ({
    email: {
        type: String,
        unique: true,
        required: true,   
    },
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    city: {
        type: String,
        required: true
    },
    inviteCode: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        required: true
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    driversLicense: {
        type: String,
        default: ''
    },
    insuranceCert: {
        type: String,
        default: ''
    },
    vehicleReg: {
        type: String,
        default: ''
    }
});


userSchema.pre('save', function (next) {
    const user = this;

    if(!user.isModified) {
        return next();
    }

    bcrypt.genSalt(10, (err, salt) => {
        if(err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, (err, hashedPassword) => {
            if(err) {
                return next(err);
            }

            user.password = hashedPassword;
            next();
        })
    })
});

userSchema.methods.comparePassword = function(password) {
    const user = this;
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if(err) {
                return reject(err);
            }

            if(!isMatch) {
                return reject(false);
            }

            resolve(true);
        })
    })
}

mongoose.model('User', userSchema);