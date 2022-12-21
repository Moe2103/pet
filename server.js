const express = require("express");
const app = express();
const path = require("path");
const db = require("./db");
const cookieSession = require("cookie-session");

const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
const encrypt = require("./encrypt");

const Handlebars = require("handlebars");

Handlebars.registerHelper("loud", function (string) {
    return string.toUpperCase();
});

const urlEncodedMiddleware = express.urlencoded({ extended: false });
app.use(urlEncodedMiddleware);
app.use(express.static("./views"));
app.use(express.static("./public"));
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/register", (req, res) => {
    // SET FORM  USER: {} & IN THE HTML NAME IS FIRSTNAME & SET {{VALUE="PREDEFINED"}}
    res.render("register", {
        layout: "main",
        helpers: {
            formStyles: "registerStyles.css",
            favicon: "favicon.ico",
            //User: {firstname: "", lastname:""} then in the hbfile {{#users & then addess its variables inside the loo}}
        },
    });
});

app.post("/register", (req, res) => {
    // console.log(req.body);
    const { firstName, lastName, email, password } = req.body;
    encrypt
        .hash(password)
        .then((hashedPWD) => {
            return db.addUserData(firstName, lastName, email, hashedPWD);
        })
        .then(({ rows }) => {
            req.session.user_id = rows[0].id;
            res.redirect("/profile");
        })
        .catch((error) => {
            if (error.code === "23505") {
                res.send(
                    "<h1>email already exists<a href='/register'>Try Again</a></h1>"
                );
            }
        });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
        helpers: {
            formStyles: "profileStyles.css",
            favicon: "favicon.ico",
        },
    });
});

app.post("/profile", (req, res) => {
    const user_id = req.session.user_id;
    const { age, city, homepage } = req.body;

    db.addProfiles(age, city, homepage, user_id).then(() =>
        res.redirect("/petition")
    );
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
        helpers: {
            formStyles: "loginStyles.css",
            favicon: "favicon.ico",
        },
    });
    //
});

app.post("/login", (req, res) => {
    const { loginEmail, loginPassword } = req.body;

    db.getEmailandPassword(loginEmail).then(({ rows }) => {
        if (rows[0]) {
            req.session.user_id = rows[0].id;
            console.log("getbyEmail:", req.session.user_id);
            encrypt
                .compare(loginPassword, rows[0].password)
                .then((passedTest) => {
                    if (passedTest) {
                        res.redirect("/petition");
                    } else {
                        res.send(
                            "<h1>You entered wrong password. <a href='/login'> Try Again</a></h1>"
                        );
                    }
                });
        } else {
            res.redirect("/register");
        }
    });
});

app.get("/petition", (req, res) => {
    // need cookie signed true
    res.render("petition", {
        layout: "main",

        helpers: {
            drawCanvasScript: "canvasDraw.js",
            formStyles: "petitionStyles.css",
            favicon: "favicon.ico",
        },
    });
});

app.post("/petition", (req, res) => {
    const user_id = req.session.user_id;
    const { signature } = req.body;
    db.addSignature(signature, user_id)
        .then(() => {
            req.session.signed = true;
            res.redirect("/thanks");
        })
        .catch((err) => console.log("err in addSignature: ", err));
});

app.get("/thanks", (req, res) => {
    const user_id = req.session.user_id;
    console.log("user_id: ", user_id);
    db.getSigImg(user_id).then(({ rows }) => {
        res.render("thanks", {
            layout: "main",
            sigArray: rows,
            helpers: {
                favicon: "favicon.ico",
            },
        });
    });
});

app.get("/signers", (req, res) => {
    db.getUserDataAll().then(({ rows }) => {
        res.render("signers", {
            layout: "main",
            signers: rows,

            helpers: {
                formStyles: "signersStyles.css",
                favicon: "favicon.ico",
            },
        });
    });
});

app.get("/signers/:signerCity", (req, res) => {
    const signersCity = req.params.signerCity;
    db.getUserByCity(signersCity).then(({ rows }) =>
        res.render("city", {
            layout: "main",
            cityArray: rows,

            helpers: {
                favicon: "favicon.ico",
            },
        })
    );
});

app.get("/edit", (req, res) => {
    // should also render the user with his signature (maybe also print certificate?)
    db.getUserByID(req.session.user_id).then(({ rows }) => {
        // console.log("rows", rows, req.session.user_id);
        res.render("edit", {
            layout: "main",
            signers: rows,
            helpers: {
                formStyles: "editStyles.css",
                favicon: "favicon.ico",
            },
        });
    });
});

app.post("/edit", (req, res) => {
    // should also render the user with his signature (maybe also print certificate?)
    const id = req.session.user_id;
    const { firstName, lastName, email, password, age, city, homepage } =
        req.body;

    db.editUsers(firstName, lastName, email, password, id);
    db.editProfile(age, city, homepage, id).then(({ rows }) => {
        // console.log("rows", req.session.user_id);
        res.redirect("/edit");
    });
});

app.post("/thanks", (req, res) => {
    const user_id = req.session.user_id;

    db.deleteTable_signatures(user_id);
    db.deleteTable_user_profiles(user_id);
    db.deleteTable_users(user_id).then(() => {
        req.session.user_id = undefined; // clear cookie
        res.send("<h1>All data deleted as requested</h1>");
        console.log("done", req.session.user_id);
    });
});

app.listen(process.env.PORT || 3000, console.log(".🧨.🧨.🧨.🧨"));
