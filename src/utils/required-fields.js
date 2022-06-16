const advertiserRegisterFields = [
  { email: "email" },
  { password: "password" },
  { companyName: "string" },
  { addressLineOne: "string" },
  { city: "string" },
  { state: "string" },
  { phoneNumber: "string" },
];

const driverRegisterFields = [
  { email: "email" },
  { name: "string" },
  { phoneNumber: "string" },
  { password: "password" },
  { city: "string" },
  { extraInfo: "object" },
];

const adminRegisterFields = [
  { email: "email" },
  { username: "string" },
  { password: "password" },
];

const riderFields = [
  { fullname: "string" },
  { email: "email" },
  { phoneNumber: "string" },
];

const triviaSessionFields = [
  { userId: "string" },
  { totalPoints: "number" },
  { questions: "number" },
  { answeredCorrectly: "number" },
];

const loginFields = [{ email: "email" }, { password: "password" }];

const verifyTokenFields = [{ token: "string" }, { userId: "string" }];

const campaignCreateFields = [
  {
    campaignName: "string",
  },
  {
    advertiser: "string",
  },
  {
    adBudget: "number",
  },
];

const mediaItemCreateFields = [
  { title: "string" },
  { duration: "string" },
  { category: "string" }
];

const classifyFieldFormat = (requiredFields, format) => {
  return requiredFields
    .filter((field) => Object.values(field)[0] === format)
    .map((field) => Object.keys(field)[0]);
};

module.exports = {
  advertiserRegisterFields,
  classifyFieldFormat,
  campaignCreateFields,
  mediaItemCreateFields,
  loginFields,
  driverRegisterFields,
  adminRegisterFields,
  riderFields,
  triviaSessionFields,
  verifyTokenFields,
};
