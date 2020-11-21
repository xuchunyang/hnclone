const debug = require("debug")("hn:util");

const generatePassword = () => {
  const chars =
    "0123456789" +
    "abcdefghijklmnopqrstuvwxyz" +
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "-_,.%()_+*/[]{}@!#$";
  const randomChar = () => {
    return Math.floor(Math.random() * chars.length) + 1;
  };
  let s = "";
  for (let i = 0; i < 8; i++) {
    s += chars[randomChar()];
  }
  debug("generatePassword: %s", s);
  return s;
};

module.exports = {
  generatePassword,
};
