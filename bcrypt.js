/*const { genSalt, hash, compare } = require("bcryptjs");

module.exports.compare = compare;

module.exports.hash = (password_hash) =>
    genSalt().then((salt) => hash(password_hash, salt));
*/

const bcrypt = require("bcryptjs");

exports.hash = (password) => {
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(password, salt);
    });
};

exports.compare = bcrypt.compare;
