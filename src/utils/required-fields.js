const advertiserRegisterFields = [
  { email: "email" },
  { password: "password" },
  { companyName: "string" },
  { addressLineOne: "string" },
  { city: "string" },
  { state: "string" },
  { phoneNumber: "string" },
];

const advertiserLoginFields = [{ email: "email" }, { password: "password" }];

const classifyFieldFormat = (requiredFields, format) => {
  switch (format) {
    case "string":
      return requiredFields
        .filter((field) => Object.values(field)[0] === "string")
        .map((field) => Object.keys(field)[0]);
    case "number":
      return requiredFields
        .filter((field) => Object.values(field)[0] === "number")
        .map((field) => Object.keys(field)[0]);

    case "password":
      return requiredFields
        .filter((field) => Object.values(field)[0] === "password")
        .map((field) => Object.keys(field)[0]);

    case "email":
      return requiredFields
        .filter((field) => Object.values(field)[0] === "email")
        .map((field) => Object.keys(field)[0]);
    default:
      return [];
  }
};

module.exports = {
  advertiserRegisterFields,
  classifyFieldFormat,
  advertiserLoginFields,
};
