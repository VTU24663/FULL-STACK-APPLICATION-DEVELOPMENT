const bcrypt = require('bcryptjs');

function createOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

async function compareOtp(otp, hash) {
  return bcrypt.compare(otp, hash);
}

module.exports = { createOtp, hashOtp, compareOtp };
