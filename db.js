require("dotenv").config();

const { SQL_USER, SQL_PASSWORD } = process.env;
const spicedPg = require('spiced-pg');
const db = spicedPg(process.env.DATABASE_URL || `postgres:${SQL_USER}:${SQL_PASSWORD}@localhost:5432/petition`);


// addUser
exports.addUser = function(firstname, lastname, email, password) {
    return db.query(`INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING *;`, [firstname, lastname, email, password])
}

// getAllSignatures 
exports.getAllSignatures = function()  {
    return db.query(`SELECT * FROM signatures;`)
}

// getAllSigners 
exports.getAllSigners = function() {
    return db.query(`
        SELECT first, last, city, age, homepage
        FROM users
        JOIN signatures
        ON users.id = signatures.user_id
        
        JOIN profiles
        ON users.id = profiles.user_id
        ;`)
}
    
// addSignature 
exports.addSignatures = function(signature, user_id)  {
    return db.query(`INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING *;`, [signature, user_id])
}

// addProfile
exports.addProfile = function(city, age, homepage, user_id) {
    // if (homepage.startsWith("http://") || homepage.startsWith("https://")) {
    return db.query(`INSERT INTO profiles (city, age, homepage, user_id) VALUES ($1, $2, $3, $4) RETURNING *;`, [city, age, homepage, user_id])
    // } else {
    //     return db.query(`INSERT INTO profiles (city, age, user_id) VALUES ($1, $2) RETURNING *;`, [city, age, user_id])
    // }
}

// check for email
exports.checkEmail = function(emaillog) {
    return db.query(`SELECT email, password, id FROM users WHERE email = $1;`, [emaillog])
}

// check for signature
exports.checkSig = function(user_id) {
    return db.query(`SELECT from signatures WHERE user_id = $1;`, [user_id])
}

// get all the signers from the same city
exports.getSignersbycity = function(city) {
    return db.query(`SELECT first, last from users INNER JOIN profiles ON profiles.user_id = users.id WHERE city = $1;`, [city])
}

// delete the signature in case of request
exports.deleteSig = function(user_id) {
    return db.query(`DELETE FROM signatures WHERE user_id = $1;`, [user_id])
}

// get the datas for the editprofile page in order to edit the profile
exports.getProfile = function(user_id) {
    return db.query(`SELECT * from users JOIN profiles ON users.id = profiles.user_id where users.id = $1`, [user_id])
}

// update users and profiles tables from the page editprofile after the signature
exports.updateProfile = function(city, age, homepage, id) {
    return db.query(`UPDATE profiles SET (city, age, homepage) = ($1, $2, $3) WHERE user_id = $4 RETURNING *;`,[city, age, homepage, id])
}
exports.updateUser = function(firstname, lastname, password, id) {
 return db.query(`UPDATE users SET (first, last, password) = ($1, $2, $3) WHERE id = $4 RETURNING *;`,[firstname, lastname, password, id])
}

// delete a users in case of request
// exports.deleteUser = function(id) {
//     return db.query(`DELETE FROM users WHERE user_id = $1;`, [user_id])
// }

   
