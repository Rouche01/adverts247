const crypto = require("crypto");

module.exports = () => {
  const randArr = new Array(4)
    .fill(0)
    .map((_val) => crypto.randomInt(9).toString())
    .reduce((prev, curr) => `${prev}${curr}`, []);
  return randArr;
};
