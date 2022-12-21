//CONNECT TO POSTGRES DATABASE
require("dotenv").config();
const { DB_URL } = process.env; // add a .env file next to the db.js file with your PostgreSQL credentials
const spicedPg = require("spiced-pg");
const db = spicedPg(DB_URL);

/*
//  - getAllSignatures - use db.query to get all signatures from table signatures
module.exports.getAllSignatures = () => {
    return db.query(`SELECT * FROM signatures`);
};
*/

// get the user by ID
module.exports.getUserById = (userId) => {
    let sql = `SELECT first, last FROM users WHERE user_id =$1`;
    return db.query(sql, [userId]);
};

//  - getAllSignatures - use db.query to get all signatures from table signatures
module.exports.getAllSignatures = () => {
    return db.query(`SELECT * FROM users`);
};

//  - addSignature - use db.query to insert a signature to table signatures
module.exports.addSignature = (userid, sig) => {
    let sql = `INSERT INTO signatures (user_id,signature) VALUES ($1,$2) RETURNING id`;

    return db.query(sql, [userid, sig]);
};

/*
module.exports.getCurrentSignature = (userId) => {
    let sql = `SELECT signature FROM signatures WHERE id =$1 `;
    return db.query(sql, [userId]);
};
*/

// get current signature
module.exports.getCurrentSignature = (userId) => {
    let sql = `SELECT signature FROM signatures WHERE user_id =$1 `;
    return db.query(sql, [userId]);
};

//delete user signature
module.exports.deletecurrentSignature = (userId) => {
    let sql = `DELETE FROM signatures WHERE user_id =$1 `;
    return db.query(sql, [userId]);
};

//  - addRegistration - use db.query to insert new users to table users
module.exports.registerUser = (firstname, lastname, email, password) => {
    let sql = `INSERT INTO users (first, last, email, password) VALUES ($1,$2,$3,$4) RETURNING id`;

    return db.query(sql, [firstname, lastname, email, password]);
};

//  - addLogin - use db.query to insert new users to table users
module.exports.loginUser = (firstname, lastname) => {
    let sql = `INSERT INTO signatures (signature, user_id) VALUES ($1,$2) RETURNING id`;

    return db.query(sql, [firstname, lastname]);
};

/*
// get email from users db. use this authentification if it exists
module.exports.getUserEmail = (userEmail) => {
    let sql = `SELECT email, password, id FROM users WHERE email =$1 `;
    return db.query(sql, [userEmail]);
};
*/

// get email from users db. use this authentification if it exists
module.exports.getUserEmail = (userEmail) => {
    //let sql = `SELECT email, password, id FROM users WHERE email =$1 `;
    let sql = `SELECT users.email, users.password, users.id, signatures.signature from users FULL OUTER JOIN signatures ON users.id =  signatures.user_id WHERE email =$1`;
    return db.query(sql, [userEmail]);
};

//  - addUserProfile - use db.query to insert new users to table users
module.exports.addUserProfile = (city, age, homepage, user_id) => {
    let sql = `INSERT INTO user_profiles (city, age, homepage, user_id) VALUES ($1,$2,$3,$4) RETURNING id`;

    return db.query(sql, [city, age, homepage, user_id]);
};

// get data from users database and user profile database
module.exports.getUserAttributes = () => {
    let sql = `SELECT users.first, users.last, users.id, user_profiles.city, user_profiles.age,user_profiles.homepage FROM users JOIN signatures ON  users.id = signatures.user_id FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id `;
    return db.query(sql);
};

//select users.email, users.password, users.id, user_profiles.city, user_profiles.age from users full outer join user_profiles on users.id = user_profiles.user_id;

//check city
module.exports.getUsersFromSameCity = (city) => {
    let sql = `SELECT users.first, users.last, users.id, user_profiles.city, user_profiles.age,user_profiles.homepage FROM users JOIN signatures ON  users.id = signatures.user_id FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id WHERE city = $1`;
    return db.query(sql, [city]);
};

// get data from users database and user profile database for edit route
// use the set cookie to get ONLY the current user
module.exports.editUserProfile = (user_id) => {
    let sql = `SELECT users.first, users.last, users.email,users.password,users.id, user_profiles.city, user_profiles.age,user_profiles.homepage FROM users FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id WHERE users.id=$1`;
    return db.query(sql, [user_id]);
};

//Update password for users that have password set
module.exports.usersWithPwdUpdate = (
    firstname,
    lastname,
    email,
    password,
    user_id
) => {
    let sql = `UPDATE users SET first =$1, last=$2, email=$3, password=$4 WHERE id = $5`;

    return db.query(sql, [firstname, lastname, email, password, user_id]);
};

//Update password for users that have password set
module.exports.usersWithoutPwdUpdate = (
    firstname,
    lastname,
    email,
    user_id
) => {
    let sql = `UPDATE users SET first =$1, last=$2, email=$3 WHERE id = $4`;

    return db.query(sql, [firstname, lastname, email, user_id]);
};

// update user profiles UPSERT
module.exports.updateUserProfiles = (city, age, homepage, user_id) => {
    let sql = `INSERT INTO user_profiles (city, age, homepage, user_id) VALUES ($1,$2,$3,$4)
    ON CONFLICT(user_id)
    DO UPDATE SET city =$1, age=$2, homepage=$3`;
    return db.query(sql, [city, age, homepage, user_id]);
};

/*
INSERT INTO user_profiles (city, age, homepage, user_id) VALUES ('Berlin',20,'www.apple.com',1) ON CONFLICT(user_id) DO UPDATE SET city ='Berlin', age=20, homepage= 'www.apple.com';
*/

/* This query works
SELECT users.first, users.last, users.id, user_profiles.city, user_profiles.age,user_profiles.homepage FROM users JOIN signatures ON  users.id = signatures.user_id FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id WHERE city = 'Berlin';
*/
