const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        user: 'soji@adverts247.ca',
        clientId: '757165172802-tv7ea9ot64b1b2eqclg7e5u8jh97dr5b.apps.googleusercontent.com',
        clientSecret: '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',
        refreshToken: '1/XXxXxsss-xxxXXXXXxXxx0XXXxxXXx0x00xxx',
        accessToken: 'ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x'
    }
});

module.exports = { transporter };
