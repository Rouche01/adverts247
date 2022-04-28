const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

const replaceTemplateLiterals = (templatePath, replacements) => {
  const source = fs.readFileSync(templatePath, "utf8").toString();
  const template = handlebars.compile(source);
  return template(replacements);
};

module.exports = { transporter, replaceTemplateLiterals };
