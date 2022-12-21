require("dotenv").config();
const { SQL_USER, SQL_PASSWORD } = process.env; // add a .env file next to the db.js file with your PostgreSQL credentials
const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${SQL_USER}:${SQL_PASSWORD}@localhost:5432/petition`
);

module.exports.getSigImg = (user_id) => {
    return db.query(`SELECT signature FROM signatures WHERE user_id = $1;`, [
        user_id,
    ]);
};

module.exports.getEmailandPassword = (loginEmail) => {
    return db.query(
        `SELECT users.id, email, password, signature FROM users FULL OUTER JOIN signatures ON users.id = signatures.user_id WHERE email = $1 `,
        [loginEmail]
    );
};

// module.exports.getEmailandPassword = (loginEmail) => {
//     return db.query(`SELECT email, password, id FROM users WHERE email = $1 `, [
//         loginEmail,
//     ]);
// };

module.exports.getUserByID = (user_id) => {
    return db.query(
        `SELECT u.firstname, u.lastname, u.email, p.city, p.age
        FROM users u
        JOIN user_profiles p ON u.id = p.user_id
        WHERE u.id = $1; `,
        [user_id]
    );
};

module.exports.getUserByCity = (city) => {
    return db.query(
        `SELECT firstname, lastname, city FROM users FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id WHERE city = $1 `,
        [city]
    );
};

module.exports.getUserDataAll = () => {
    return db.query(
        `SELECT users.firstname, users.lastname, users.email, user_profiles.city, user_profiles.age, user_profiles.homepage, 
        * FROM users
        FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id;`
    );
};

module.exports.addUserData = (firstName, lastName, email, password) => {
    return db.query(
        `INSERT INTO users (firstname, lastname, email, password) 
      VALUES ($1, $2, $3, $4) RETURNING id`,
        [firstName, lastName, email, password]
    );
};

module.exports.addProfiles = (city, age, homepage, user_id) => {
    return db.query(
        `INSERT INTO user_profiles (city, age, homepage, user_id) 
      VALUES ($1, $2, $3, $4)`,
        [city, age, homepage, user_id]
    );
};

module.exports.editUsers = (firstName, lastName, email, password, id) => {
    return db.query(
        `UPDATE users
        SET firstname = $1, lastname = $2, email = $3,
        password = CASE WHEN $4 = '' THEN password ELSE $4 END  
        WHERE id = $5;`,
        [firstName, lastName, email, password, id]
    );
};

module.exports.editProfile = (age, city, homepage, id) => {
    return db.query(
        `UPDATE user_profiles
        SET age = $1, city = $2, homepage = $3
        WHERE user_id = $4;`,
        [age, city, homepage, id]
    );
};

module.exports.addSignature = (signature, user_id) => {
    return db.query(
        `INSERT INTO signatures (signature, user_id) 
      VALUES ($1, $2)`,
        [signature, user_id]
    );
};

module.exports.deleteTable_user_profiles = (user_id) => {
    return db.query(
        `
        DELETE FROM user_profiles WHERE user_id = $1;
        `,
        [user_id]
    );
};

module.exports.deleteTable_signatures = (user_id) => {
    return db.query(
        `
        DELETE FROM signatures WHERE user_id = $1;
        `,
        [user_id]
    );
};

module.exports.deleteTable_users = (user_id) => {
    return db.query(
        `
        DELETE FROM users WHERE id = $1;
        `,
        [user_id]
    );
};
