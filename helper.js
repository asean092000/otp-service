const bcrypt = require("bcrypt");
const salting = 12;

async function hashPassword(plaintextPassword) {
    return await bcrypt.hash(plaintextPassword, salting);
}

// compare password
async function comparePassword(plaintextPassword, hash) {
    return await await bcrypt.compare(plaintextPassword, hash);
}

function whitelist(validIps, ip) {
    if(validIps.includes(ip)){
        return true;
    }

    return false;
}

module.exports = {
    hashPassword,
    comparePassword,
    whitelist
}