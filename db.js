require("dotenv").config();
const { SQL_USER, SQL_PASSWORD } = process.env; // add a .env file next to the db.js file with your PostgreSQL credentials
const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${SQL_USER}:${SQL_PASSWORD}@localhost:5432/petition`
);

// Function to SELECT signatures
module.exports.getSignature = () => {
    return db.query(`SELECT * FROM signatures;`);
};

// Function to INSERT signatures
module.exports.addSignature = (signature, userid) => {
    return db.query(
        `INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING * `,
        [signature, userid]
    );
};

// Function to INSERT users
module.exports.addUsers = (firstNname, lastNname, email, password) => {
    return db.query(
        `INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING * `,
        [firstNname, lastNname, email, password]
    );
};

// Function to INSERT users_profile

module.exports.addUsers_profile = (age, city, homepage, userid) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, homepage, user_id) VALUES ($1, $2, $3, $4) RETURNING * `,
        [age, city, homepage, userid]
    );
};

//Function to get FULL JOIN of both tables
module.exports.getTables = () => {
    return db.query(`
        SELECT users.id, users.firstname, users.lastname, users.email, user_PROFILES.city, user_PROFILES.age, user_PROFILES.homepage, signatures.signature 
        FROM users
        JOIN signatures ON users.id = signatures.user_id
        FULL OUTER JOIN user_profiles
        ON users.id = user_PROFILES.user_id`);
};

//Function to UPDATE AND INSERT data
//module.exports.update = (firstname, lastname, email) => {
//return db.query(``)
//}
// Function to get signers
module.exports.getCity = (city) => {
    return db.query(
        `
        SELECT users.id, users.firstname, users.lastname, users.email, user_PROFILES.city, user_PROFILES.age, user_PROFILES.homepage, signatures.signature  
        FROM users
        JOIN signatures ON users.id = signatures.user_id
        FULL OUTER JOIN user_profiles
        ON users.id = user_PROFILES.user_id
        where city = $1`,
        [city]
    );
};

module.exports.getUserbyId = (userid) => {
    return db.query(
        `SELECT users.id, users.firstname, users.lastname, users.email, user_PROFILES.city, user_PROFILES.age, user_PROFILES.homepage 
        FROM users
        FULL OUTER JOIN user_profiles
        ON users.id = user_PROFILES.user_id 
        where users.id = $1`,
        [userid]
    );
};

module.exports.updateUserbyId = (userid, firstname, lastname, email) => {
    return db.query(
        `
    UPDATE users 
    SET firstname = $1, lastname = $2, email = $3 
    WHERE id = $4
 `,
        [firstname, lastname, email, userid]
    );
};

module.exports.updateUserProfilesbyId = (userid, age, city, homepage) => {
    return db.query(
        `
    UPDATE user_profiles
    SET age = $1, city = $2, homepage = $3
    WHERE id = $4
    `,
        [age, city, homepage, userid]
    );
};
