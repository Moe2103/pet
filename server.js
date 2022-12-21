// const express = require("express");

// const app = express();
// const { engine } = require("express-handlebars");

// const { addSignature, getAllSignature } = require("./db");
// require("dotenv").config();

// app.engine("handlebars", engine());
// app.set("view engine", "handlebars");

// const urlEncodedMiddleware = express.urlencoded({ extended: false });
// app.use(urlEncodedMiddleware);

// app.use(express.static("./views"));
// app.use(express.static("./public"));

// app.get("/petition", (req, res) => {
//     res.render("petition", {
//         layout: "main",
//         helpers: {
//             Canvas: "/canvas.js",
//             formStyles: "/style.css",
//         },
//     });
// });

// app.post("/petition", (req, res) => {
//     const { firstName, lastName, signature } = req.body;

//     addSignature(firstName, lastName, signature);

//     res.redirect("/thanks");
// });

// app.get("/thanks", (req, res) => {
//     res.render("thanks", {
//         layout: "main",
//     });
// });

// app.get("/signers", (req, res) => {
//     res.render("signers", {
//         layout: "main",
//     });
// });

// app.listen(8080, () => {
//     console.log("Server running on localhost:8080");
// });

// requiring the different packages

const express = require("express");

const app = express();

const cookieSession = require("cookie-session");

const urlEncodedMiddleware = express.urlencoded({ extended: false });

require("dotenv").config();

// requiring the different database informations
const {
    getAllSignatures,
    addSignature,
    addUserData,
    getUserByEmail,
    ifUserSigned,
    getAllSigned,
    addMoreData,
    getOneCity,
    getUserById,
    updateUser,
    updatePass,
    updateUserProfile,
    deleteSignature,
    deleteUser,
} = require("./db.js");

// undefinded variable for later

let warning = false;
let allData;
let userData;
let Hash;
let Signers;
let firstName;
let lastName;
let finaleimage;
let canvasImg;
let oneUser;
let page;
let age;
let city;
let email;
let password;

// requiring password stuff
const { hashPass, compare } = require("./encrypt");

// Handlebars setup

const { engine } = require("express-handlebars");
//const res = require("express/lib/response");
const { application } = require("express");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// middlewars and cookies

app.use(express.static("./views"));
app.use(express.static("./public"));
app.use(urlEncodedMiddleware);

app.use(
    cookieSession({
        secret: "hallo ich bin Marcell",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

// different pathways

app.use((req, res, next) => {
    if (
        (req.url.startsWith("/login") ||
            req.url.startsWith("/registration") ||
            req.url.startsWith("/petition")) &&
        req.session.reglog
    ) {
        res.redirect("/thanks");
    } else if ((
        req.url.startsWith("/signers") ||
        req.url.startsWith("/thanks") ||
        req.url.startsWith("/profile") ||
        req.url.startsWith("/edit") ||
        req.url.startsWith("/petition")) && !req.session.reglog
    ) {
        res.redirect("/registration");
    } else {
        next();
    }
});

app.use((req, res, next) => {
    console.log("cookies: ", req.session);
    next();
});

app.get("/", (req, res) => {
    res.redirect("/registration/");
});

app.get("/registration", (req, res) => {
    res.render("registration", {
        layout: "main",
    });
});

// User regostration post .

app.post("/registration", (req, res) => {
    console.log(req.body);
    firstName = req.body.firstName;
    lastName = req.body.lastName;
    email = req.body.email;
    password = req.body.password;

    if (
        firstName === "" ||
        lastName === "" ||
        email === "" ||
        password === ""
    ) {
        warning = true;
        res.redirect("/registration");
        return;
    }

    hashPass(password).then((hash) => {
        // console.log("hashed data: ", hash);
        addUserData(firstName, lastName, email, hash)
            .then((data) => {
                console.log(data);
                req.session.reglog = data.rows[0].id;
                res.redirect("/profile");
            })
            .catch((err) => console.log("Registration problem", err));
    });
});

//

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
        warning,
    });
    warning = false;
});

app.post("/login", (req, res) => {
    email = req.body.email;

    password = req.body.password;
    getUserByEmail(email)
        .then((data) => {
            if (data.rowCount === 0) {
                warning = true;
                res.redirect("/login/");
                return;
            }
            Hash = data.rows[0].password;
            compare(password, Hash, function (err, result) {
                if (result) {
                    req.session.reglog = data.rows[0].id;
                    firstName = data.rows[0].first;
                    lastName = data.rows[0].last;
                    ifUserSigned(req.session.reglog).then((data) => {
                        if (data.rowCount !== 0) {
                            req.session.signid = data.rows[0].id;
                            res.redirect("/thanks/");
                            return;
                        }
                        res.redirect("/petition/");
                    });
                } else {
                    warning = true;
                    res.redirect("/login/");
                }
            });
        })
        .catch((err) => console.log("Login problem:", err));
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
        warning,
    });
    warning = false;
});

app.post("/profile", (req, res) => {
    age = req.body.age;
    city = req.body.city;
    page = req.body.page;

    addMoreData(age, city, page, req.session.reglog)
        .then((data) => {
            res.redirect("/petition/");
        })
        .catch((err) => console.log("Profile not founded:", err));
});

app.get("/petition", (req, res) => {
    getAllSignatures()
        .then((data) => {
            Signers = data.rows.length;

            res.render("petition", {
                layout: "main",
                Signers,
                firstName,
                lastName,
            });
            warning = false;
        })
        .catch((err) => console.log(err));
});

app.post("/petition", (req, res) => {
    canvasImg = req.body.signature;

    if (canvasImg === "") {
        warning = true;
        res.redirect("/petition/");
    } else {
        warning = false;
        addSignature(canvasImg, req.session.reglog)
            .then((data) => {
                req.session.signid = data.rows[0].id;
                res.redirect("/thanks/");
            })
            .catch((err) => console.log(err));
    }
});

app.get("/edit", (req, res) => {
    getUserById(req.session.reglog)
        .then((data) => {
            oneUser = data.rows[0];
            res.render("edit", {
                layout: "main",
                warning,
                oneUser,
            });
            warning = false;
        })
        .catch((err) => console.log("Edit error: ", err));
});

app.post("/edit", (req, res) => {
    updateUser(
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        req.session.reglog
    );

    if (req.body.password !== "") {
        compare(req.body.password, oneUser.password, function (err, result) {
            if (!result) {
                console.log(
                    "New pass != old pass",
                    req.body.password,
                    oneUser.password
                );
                hashPass(req.body.password)
                    .then((hash) => {
                        console.log("hashed data: ", hash);
                        updatePass(hash, req.session.reglog);
                    })
                    .catch((err) => console.log("Update pass error: ", err));
            }
        });
    }

    updateUserProfile(
        req.body.age,
        req.body.city,
        req.body.page,
        req.session.reglog
    );

    res.redirect("/thanks/");
});

app.get("/thanks", (req, res) => {
    getAllSignatures()
        .then((data) => {
            Signers = data.rows.length;
            userData = data.rows.find((a) => {
                return a.id === req.session.signid;
            });
            finaleimage = userData.signature;
            res.render("thanks", {
                layout: "main",
                Signers,
                allData,
                firstName,
                finaleimage,
            });
        })
        .catch((err) => console.log("No Data found for thanks", err));
});

app.get("/signers", (req, res) => {
    getAllSigned()
        .then((data) => {
            allData = data.rows;
            console.log(allData);
            Signers = data.rows.length;
            res.render("signers", {
                layout: "main",
                allData,
                Signers,
            });
        })
        .catch((err) => console.log("Signers cat not find", err));
});

app.get("/signers/:city", (req, res) => {
    let city = req.params.city;
    getOneCity(city)
        .then((data) => {
            allData = data.rows;
            res.render("cities", {
                layout: "main",
                allData,
                city,
            });
        })
        .catch((err) => console.log(err));
});

app.post("/delete-sig", (req, res) => {
    deleteSignature(req.session.reglog);
    req.session.signid = false;
    res.redirect("/petition/");
});

app.post("/delete-user", (req, res) => {
    deleteUser(req.session.reglog);
    req.session.signid = false;
    req.session.reglog = false;
    res.redirect("/registration/");
});

app.listen(process.env.PORT || 8080, () => {
    console.log(`Petition server listening on port 8080`);
});