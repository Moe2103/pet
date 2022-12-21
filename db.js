require("dotenv").config();
const { SQL_USER, SQL_PASSWORD } = process.env; // add a .env file next to the db.js file with your PostgreSQL credentials
const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${SQL_USER}:${SQL_PASSWORD}@localhost:5432/deyuk`
);

const bcrypt = require("bcryptjs");
/*
module.exports.hash = (password) => {
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(password, salt);
    });
};
*/

module.exports.hash = (password) => {
    /*
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);*/
    console.log(password, "this is my init pass");
    bcrypt.hash(password, 10, function (err, hash) {
        // store hash in the database
        console.log(password, "pass", hash, "hash", "I am inside bcrypt.hash");
        return hash;
    });
};

module.exports.getSign = () => {
    const q = `SELECT * FROM signatures`;
    return db.query(q);
};

module.exports.addSign = (signature, user_id) => {
    const q = `
        INSERT INTO signatures (signature, user_id)
        VALUES ($1, $2)
        RETURNING user_id
        `;
    const params = [signature, user_id];
    return db.query(q, params);
};

module.exports.findUserByEmail = function (email) {
    const sql = `SELECT id, email, password FROM users WHERE email = $1;`;

    return db.query(sql, [email]);
};

module.exports.authenticate = function (email, password) {
    console.log(email, password, "db.js");
    return this.findUserByEmail(email).then((result) => {
        return bcrypt
            .compare(password, result.rows[0].password)
            .then((success) => {
                return success;
            });
        /*
        bcrypt.compare(
            password,
            result.rows[0].password,
            function (err, result) {
                if (result) {
                    console.log(result);
                    // password is valid
                }
            }
        );
        */
        //return bcrypt.CompareSync(password, result.rows[0].password); //
    });
};

module.exports.insertUser = function (first_name, last_name, email, password) {
    const sql = `
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    /*
    return this.hash(password).then((hpassword) => {
        return db
            .query(sql, [first_name, last_name, email, hpassword])
            .then((result) => result.rows)
            .catch((error) => console.log("error inserting signature", error));
    });*/
    console.log(password, "my password inside insert User");
    return db
        .query(sql, [first_name, last_name, email, password])
        .then((result) => result.rows)
        .catch((error) => console.log("error inserting signature", error));
};

module.exports.insertProfile = function (age, city, homepage, user_id) {
    const sql = `
        INSERT INTO profiles (age, city, homepage, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    return db
        .query(sql, [age, city, homepage, user_id])
        .then((result) => result.rows)
        .catch((error) => console.log("error inserting signature", error));
};

module.exports.getAllUserInfo = function (user_id) {
    const sql =
        "SELECT users.id, first_name, last_name, email, password, age, city, homepage FROM users LEFT JOIN profiles ON users.id = profiles.user_id WHERE users.id = $1;";
    return db
        .query(sql, [user_id])
        .then((result) => {
            return result.rows;
        })
        .catch((error) => {
            console.log("ERROR", error);
        });
};

module.exports.updateUserDataWithPassword = function (
    user_id,
    first_name,
    last_name,
    email,
    password
) {
    const sql =
        "UPDATE users SET first_name = $1, last_name = $2, email = $3, password = $4 WHERE id = $5;";

    return this.hash(password).then((hpassword) => {
        return db
            .query(sql, [first_name, last_name, email, hpassword, user_id])
            .then((result) => {
                return result.rows;
            })
            .catch((error) => {
                console.log("ERROR", error);
            });
    });
};

module.exports.updateUserDataWithoutPassword = function (
    user_id,
    first_name,
    last_name,
    email
) {
    const sql =
        "UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4;";
    return db
        .query(sql, [first_name, last_name, email, user_id])
        .then((result) => {
            return result.rows;
        })
        .catch((error) => {
            console.log("ERROR", error);
        });
};

module.exports.upsertUserProfileData = function (user_id, age, city, homepage) {
    const sql = `
    INSERT INTO profiles (age, city, homepage, user_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET age = $1, city = $2, homepage = $3, user_id = $4;`;

    console.log([user_id, age, city, homepage]);

    return db.query(sql, [user_id, age, city, homepage]);
};

module.exports.findFirstNameById = function (id) {
    const sql = "SELECT first_name FROM users WHERE id = $1;";
    return db
        .query(sql, [id])
        .then((result) => {
            return result.rows;
        })
        .catch((error) => {
            console.log("ERROR in finding signature", error);
        });
};

module.exports.insertSignature = function (signature, user_id) {
    const sql = `
        INSERT INTO signatures (signature, user_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
    return db
        .query(sql, [signature, user_id])
        .then((result) => result.rows)
        .catch((error) => console.log("error inserting signature", error));
};

module.exports.findSignatureById = function (id) {
    const sql = "SELECT signature FROM signatures WHERE user_id = $1;";
    return db
        .query(sql, [id])
        .then((result) => {
            return result.rows;
        })
        .catch((error) => {
            console.log("ERROR in finding signature", error);
        });
};

module.exports.getSignersNumber = function () {
    const sql = "SELECT COUNT(*) FROM signatures;";
    return db.query(sql).catch((error) => {
        console.log("ERROR in finding signature", error);
    });
};

module.exports.deleteSignature = function (user_id) {
    const sql = "DELETE FROM signatures WHERE user_id = $1;";
    return db.query(sql, [user_id]).catch((error) => {
        console.log("ERROR in finding signature", error);
    });
};

module.exports.getAllSignatures = function () {
    const sql =
        "SELECT users.id, first_name, last_name, age, city, homepage FROM users LEFT JOIN profiles ON users.id = profiles.user_id ORDER BY id ASC;";

    return db
        .query(sql)
        .then((result) => {
            return result.rows;
        })
        .catch((error) => {
            console.log("error selecting signatures", error);
        });
};

module.exports.getAllSignersByCity = function (city) {
    const sql =
        "SELECT first_name, last_name, age, city, homepage FROM users LEFT JOIN profiles ON users.id = profiles.user_id WHERE city = $1;";

    return db
        .query(sql, [city])
        .then((result) => {
            return result.rows;
        })
        .catch((error) => {
            console.log("error selecting signatures", error);
        });
};
