// hash.js
const bcrypt = require("bcrypt");

bcrypt.hash("111", 10).then(hash => {
  console.log(hash);
});