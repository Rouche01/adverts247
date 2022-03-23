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

const classifyFieldFormat = (requiredFields, format) => {
  return requiredFields
    .filter((field) => Object.values(field)[0] === format)
    .map((field) => Object.keys(field)[0]);
};

module.exports = {
  advertiserRegisterFields,
  classifyFieldFormat,
  loginFields,
  driverRegisterFields,
  adminRegisterFields,
  riderFields,
  triviaSessionFields,
};
