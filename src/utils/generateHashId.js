const { customAlphabet } = require("nanoid");

const CUSTOM_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const generateHashId = ({ prefix, length }) => {
  const nanoId = customAlphabet(CUSTOM_ALPHABET, length);
  return prefix ? `${prefix}-${nanoId()}` : nanoId();
};

module.exports = { generateHashId };
