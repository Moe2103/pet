require("dotenv").config();
const { SQL_USER, SQL_PASSWORD } = process.env;
const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${SQL_USER}:${SQL_PASSWORD}@localhost:5432/petition`
);
//`postgres:${SQL_USER}:${SQL_PASSWORD}@localhost:5432/petiton`
/// Maybe render issue; create one variable that includes both in the env file

//----------------------------------------------------------------------------------------------------------------------------------

module.exports.registration = (firstname, lastname, email, password) => {
    return db.query(
        "INSERT INTO users (firstname, lastname, email, password) VALUES($1, $2, $3, $4) returning *",
        [firstname, lastname, email, password]
        // RETURNING id
    );
};

//----------------------------------------------------------------------------------------------------------------------------------

module.exports.getUserByEmail = (email) => {
    return db.query(
        "SELECT users.password, users.id, signatures.signature FROM users FULL OUTER JOIN signatures ON users.id = signatures.id WHERE email = $1 ",
        [email]
    );
};

//  return db.query("SELECT users.password, users.id  FROM users WHERE email = $1 ON sog  ", [email]);

// "SELECT * FROM users JOIN signatures ON users.id = signatures.user_id LEFT OUTER JOIN users_profiles ON users.id = users_profiles.user_id"
// Create full outerjoin with signature table the id from user table= signature table

//----------------------------------------------------------------------------------------------------------------------------------

// module.exports.checkSigned = (user_id) => {
//     return db.query("SELECT signature FROM signatures WHERE user_id = $1", [
//         user_id,
//     ]);
// };

//----------------------------------------------------------------------------------------------------------------------------------

module.exports.addInfo = (city, age, linkedIn, user_id) => {
    return db.query(
        "INSERT INTO users_profiles (city, age, linkedIn, user_id) VALUES($1, $2, $3, $4)",
        [city, age, linkedIn, user_id]
    );
};

//----------------------------------------------------------------------------------------------------------------------------------

// ----- addSignature - use db.query to insert a signature to table signatures
module.exports.addSignature = (signature, user_id) => {
    return db.query(
        "INSERT INTO signatures (signature, user_id) VALUES($1, $2) returning *",
        [signature, user_id]
        // RETURNING id
    );
};

//----------------------------------------------------------------------------------------------------------------------------------
module.exports.profileJoin = () => {
    /// Users & Signatures
    return db.query(
        "SELECT * FROM users JOIN signatures ON users.id = signatures.user_id"
    );
};

// Create the following functions;
// ----- getAllSignatures - use db.query to get all signatures from table signatures

module.exports.getSignatures = (user_id) => {
    return db.query("SELECT signature FROM signatures WHERE user_id = $1", [
        user_id,
    ]);
};

module.exports.getSigCount = () => {
    return db.query("SELECT count(*) FROM signatures");
};

module.exports.getSupportCount = () => {
    return db.query("SELECT count(*) FROM users");
};

/// Delete Signature
module.exports.deleteSig = (userId) => {
    return db.query("DELETE FROM signatures WHERE user_id =$1", [userId]);
};

//----------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------
module.exports.allQuery = () => {
    return db.query(
        "SELECT * FROM users JOIN signatures ON users.id = signatures.user_id LEFT OUTER JOIN users_profiles ON users.id = users_profiles.user_id"
    );
};

module.exports.cityQuery = (city) => {
    return db.query(
        "SELECT * FROM users JOIN signatures ON users.id = signatures.user_id LEFT OUTER JOIN users_profiles ON users.id = users_profiles.user_id WHERE city = $1",
        [city]
    );
};
// Doubel check this query

//----------------------------------------------------------------------------------------------------------------------------------

// Getting all relevant values from db
//----------------------------------------------------------------------------------------------------------------------------------

module.exports.allInfos = (user_id) => {
    return db.query(
        "SELECT * FROM users LEFT OUTER JOIN users_profiles ON users.id = users_profiles.user_id WHERE users.id = $1 ",
        [user_id]
    );
};
//----------------------------------------------------------------------------------------------------------------------------------
// module.exports.deleteSignature = () => {};

//----------------------------------------------------------------------------------------------------------------------------------

// module.exports.getUserById = () => {};

//----------------------------------------------------------------------------------------------------------------------------------
module.exports.editUser = (firstname, lastname, email, user_id) => {
    return db.query(
        "UPDATE users SET firstname = $1, lastname = $2, email = $3 WHERE id = $4",
        [firstname, lastname, email, user_id]
    );
};

//----------------------------------------------------------------------------------------------------------------------------------
module.exports.updateUserProfil = (city, age, linkedIn, user_id) => {
    return db.query(
        "UPDATE users_profiles SET city = $1, age = $2, linkedIn = $3 WHERE user_id = $4",
        [city, age, linkedIn, user_id]
    );
};

//----------------------------------------------------------------------------------------------------------------------------------
module.exports.allUsers = () => {
    return db.query();
};
//     "SELECT firstname, lastname, age, city, linkedIn, signatures.created_at as signed_at FROM users JOIN users_profiles ON user.id = users_profules.user_id JOIN signatures ON users.id = signatures.user_id WHERE signatures.signature != '' ORDER BY signatures.created_at DESC "

// "SELECT * FROM users INNER JOIN signatures ON users.id = signatures.user_id FULL OUTER JOIN user_profiles ON users.id = users_profiles.user_id ORDER by users.created_at ";

//----------------------------------------------------------------------------------------------------------------------------------

// module.export.passwordCheck = () => {
//     return db.query("UPDATE password FROM users ");
// };

// module.exports.inserOrUpdateUserProfile = () => {
//     return db.query("INSERT");
// };

//----------------------------------------------------------------------------------------------------------------------------------
