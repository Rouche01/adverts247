const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  host: "smtp.mailersend.net",
  port: 587,
  secure: true, // upgrade later with STARTTLS
  auth: {
    user: "MS_m2EtTY@adverts247.com",
    pass: "IcYhYuIRRzEWlAGp",
  },
});

const replaceTemplateLiterals = (templatePath, replacements) => {
  const source = fs.readFileSync(templatePath, "utf8").toString();
  const template = handlebars.compile(source);
  return template(replacements);
};

module.exports = { transporter, replaceTemplateLiterals };
