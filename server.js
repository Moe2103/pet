// express makes https requests

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { engine } = require("express-handlebars");
const db = require("./db.js");
const encrypt = require("./bcrypt.js");

app.use(express.static("./public"));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
//  bodyParser makes sure that we can parse the incoming req bodies

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const urlEncodedMiddleware = express.urlencoded({ extended: false });
app.use(urlEncodedMiddleware);

// ---------- COOKIES ----------

const cookieSession = require("cookie-session");

app.use(
    cookieSession({
        secret: process.env.SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

// ---------- DEFAULT ROUTE ----------

app.get("/", (req, res) => {
    if (req.session.userId && !req.session.signatureId) {
        res.redirect("/petition");
    } else if (req.session.userId && req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        res.redirect("/registration");
    }
});
// Default route working.

// ---------- REGISTRATION PAGE ----------

app.get("/registration", (req, res) => {
    if (req.session.userId && !req.session.signatureId) {
        res.redirect("/petition");
    } else if (req.session.userId && req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        res.render("registration", { title: "registration" });
    }
});

app.post("/registration", (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    console.log(req.body);
    encrypt.hash(password).then((hash) => {
        return db.insertUser(firstName, lastName, email, hash);
    });
    res.redirect("/login");
});

// ---------- LOGIN PAGE ----------

app.get("/login", (req, res) => {
    if (req.session.userId && !req.session.signatureId) {
        res.redirect("/petition");
    } else if (req.session.userId && req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        res.render("login", { title: "Login" });
    }
});

app.post("/login", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    db.findUserByEmail(email).then((result) => {
        console.log(result);
        db.authenticate(email, password).then((success) => {
            console.log(success);
            if (success === true) {
                req.session.userId = result.rows[0].id;
                req.session.signatureId = result.rows[0].id;
                res.redirect("/petition");
            } else {
                res.redirect("/login");
            }
        });
    });
});

// ---------- PETITION PAGE ----------

app.get("/petition", (req, res) => {
    if (!req.session.userId && !req.session.signatureId) {
        return res.redirect("/login");
    }
    res.render("petition", {
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    let url = req.body.signature;
    let username = req.session.userId;
    let title = req.session.userId;

    let destination = req.session.userId;

    db.insertSignature(url, username, title, destination)
        .then((sign) => {
            req.session.signatureId = sign[0].user_id;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("ERROR in inserting Signature: ", err);
        });
});

// ---------- THANKS PAGE ----------

app.get("/thanks", (req, res) => {
    if (!req.session.userId && !req.session.signatureId) {
        return res.redirect("/registration");
    }
    res.render("thanks", {
        layout: "main",
    });
});

// ---------- SIGNERS PAGE ----------

app.get("/signers", (req, res) => {
    if (!req.session.userId && !req.session.signatureId) {
        res.redirect("/login");
    } else if (req.session.userId && !req.session.signatureId) {
        res.redirect("/petition");
    } else {
        db.getAllSignatures()
            .then((rows) => {
                res.render("signers", { title: "signers", rows });
            })
            .catch((err) => {
                console.log("something wrong in getAllSignatures: ", err);
            });
    }
});

// ---------- PROFILE ----------

app.get("/profile", (req, res) => {
    if (req.session.userId && req.session.signatureId) {
        res.render("profile");
    } else {
        res.render("login", { layout: "login" });
    }
});

app.post("/profile", (req, res) => {
    let age = req.body.age;
    let city = req.body.city;
    let homepage = req.body.homepage;
    let user_id = req.session.userId;

    db.insertProfile(age, city, homepage, user_id)
        .then(() => {
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("ERROR: ", err);
        });
});

// ---------- EDIT ----------

app.get("/edit", (req, res) => {
    if (!req.session.userId && !req.session.signatureId) {
        res.redirect("/login");
    } else {
        let user_id = req.session.userId;
        db.getAllUserInfo(user_id)
            .then((rows) => {
                res.render("edit", {
                    title: "edit your profile",
                    first_name: rows[0].first_name,
                    last_name: rows[0].last_name,
                    email: rows[0].email,
                    age: rows[0].age,
                    city: rows[0].city,
                    homepage: rows[0].homepage,
                });
            })
            .catch((err) => {
                console.log("ERROR in getAllUserInfo: ", err);
            });
    }
});

app.post("/edit", (req, res) => {
    if (!req.session.userId && !req.session.signatureId) {
        res.redirect("/login");
    } else {
        let user_id = req.session.userId;
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let email = req.body.email;
        let password = req.body.password;
        let age = req.body.age;
        let city = req.body.city;
        let homepage = req.body.homepage;
        let userUpdatePromise;

        if (password) {
            userUpdatePromise = db.updateUserDataWithPassword(
                user_id,
                first_name,
                last_name,
                email,
                password
            );
        } else {
            userUpdatePromise = db.updateUserDataWithoutPassword(
                user_id,
                first_name,
                last_name,
                email
            );
        }
        userUpdatePromise
            .then(() => {
                return db.upsertUserProfileData(age, city, homepage, user_id);
            })
            .then(() => {
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log(err);
            });
    }
});

// ---------- CITY ----------
app.get("/signers/:city", (req, res) => {
    if (!req.session.userId && !req.session.signatureId) {
        res.redirect("/login");
    } else if (req.session.userId && !req.session.signatureId) {
        res.redirect("/petition");
    } else {
        let city = req.params.city;
        db.getAllSignersByCity(city)
            .then((rows) => {
                // console.log(rows);
                res.render("signerscity", {
                    title: "Signatures by City",
                    rows,
                    city,
                });
            })
            .catch((err) => {
                console.log("ERROR", err);
            });
    }
});

// ---------- LOGOUT ----------

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/logIn");
});

// ---------- LOCALHOST ----------
app.listen(process.env.PORT || 8081, () => {
    console.log("Server is up bruv  localhost:8081");
});
