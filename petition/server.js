//++++++++++++++ HANDLEBARS+++++++++++++++++
//create "views" folder and add all handlebars files
require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path"); // use path.join() for concatenating paths
const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const cookieSession = require("cookie-session");

//there are different engines. Handlebars is just one of them
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.static("./public"));
app.use(express.static("./img"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
//
const {
    requireLoggedInUSer,
    requireLoggedOutUSer,
    requireSignature,
    requireNoSignature,
} = require("./middleware");

const { hashPass, compare } = require("./encrypt");

app.use(
    cookieSession({
        secret: process.env.SESSION_SECRET,
        //secret: "test123",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

//citing https://www.tutsmake.com/node-js-express-insert-data-from-form-into-mysql-database/

const db = require("./db");

//get all the people that have signed the petition
//let signersList = getAllSignatures();

//console.log("===========signersList============", signersList);

const contentTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json",
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
};

// middleware to serve static files from a specific folder
//const staticMiddleware = express.static(path.join(__dirname, "projects"));
//app.use(staticMiddleware);

//=================================REGISTER==========================================
//register
app.get("/register", requireLoggedOutUSer, (req, res) => {
    if (req.session.userID) {
        return res.redirect("/thanks");
    }

    res.render("register");
});

//register new users and add them to database
// this is the first page
app.post("/register", requireLoggedOutUSer, (req, res) => {
    let first_name = req.body.firstname;

    let last_name = req.body.lastname;

    let email = req.body.email;

    let userPassword = req.body.password;

    //hash the password that the user inputs

    hashPass(userPassword)
        .then((hashedPassword) => {
            console.log("this password is hashed", hashedPassword);
            return db.registerUser(
                first_name,
                last_name,
                email,
                hashedPassword
            );
        })
        .then(({ rows }) => {
            console.log("rows id", rows[0].id);
            req.session.userID = rows[0].id;

            console.log("record inserted");

            //ask users to provide more information
            //res.redirect("/thanks");
            // redirect to userprofile and ask for more information
            res.redirect("/userprofile");
        })
        .catch((err) => {
            console.log("error appeared for query: ", err);
            res.redirect("/register");
        });

    console.log("this is a test", req.body);
});

//=================================LOGIN=========================================
//login
app.get("/login", requireLoggedOutUSer, (req, res) => {
    /*if (req.session.userID) {
        return res.redirect("/thanks");
    }
    */
    res.render("login");
});

app.post("/login", requireLoggedOutUSer, (req, res) => {
    //signature is stored as cookie in req.session.userID

    //get user email from the form
    let userEmail = req.body.email;

    //get user email from the form
    let userPassword = req.body.password;

    //let signature = req.session.userID;
    console.log("++++++email++++++", userEmail);
    console.log("++++++password++++++", userPassword);

    //1. get the user from database based on email
    db.getUserEmail(userEmail)
        .then(({ rows }) => {
            //console.log("rows email", rows[0].email);
            //console.log("rows password", rows[0].password);
            console.log("roooooooooooows", rows[0]);
            //console.log("email in users database", req.body.email);
            //2. check condition if user exists from 1
            if (userEmail === rows[0].email) {
                console.log("we have an match");
                //3. if user exists check if password matches
                console.log("raw password", userPassword);
                console.log("hashed password", rows[0].password);
                return compare(userPassword, rows[0].password).then(
                    (boolean) => {
                        console.log(`the password matches ${boolean}`);

                        //4. set session cookies
                        req.session.userID = rows[0].id;

                        console.log("*****rows signature", rows[0].signature);

                        // now check if the signature is available
                        if (rows[0].signature) {
                            //set cookie if signature is available
                            req.session.signed = true;

                            res.redirect("/thanks");
                        } else {
                            //redirect to petition
                            res.redirect("/petition");
                        }
                    }
                );
            }
        })
        .catch((err) => {
            console.log("error appeared for query: ", err);
            res.redirect("/register");
        });

    //5.do we have a signature

    //get userid
    //let userid = req.body.lastname;
});

//encryptß
app.get("/hashing", (req, res) => {
    const str = "MintCohort";
    hashPass(str).then((hashedPassword) => {
        console.log(hashedPassword);
        //compares (actual passwd, hashed passwd)
        compare(str, hashedPassword).then((boolean) => {
            console.log(`the password matches ${boolean}`);
        });
    });
});

//==========================USER PROFILE==============================

//userprofile get route
app.get("/userprofile", requireLoggedInUSer, (req, res) => {
    res.render("userprofile");
});

//userprofile post route
app.post("/userprofile", requireLoggedInUSer, (req, res) => {
    let city = req.body.city;

    let age = req.body.age;
    let homepage = req.body.homepage;

    console.log("+++++++HOMEPAGE+++++++", homepage);

    console.log("+++++++CITY+++++++", city);
    console.log("+++++++AGE+++++++", age);

    let updatedHomepage;
    if (homepage.startsWith("http://") || homepage.startsWith("https://")) {
        updatedHomepage = homepage;
    } else {
        updatedHomepage = "https://" + homepage;
    }

    // user_id is set in the cookie
    //let user_id = req.session.userID;

    //res.redirect("/petition");
    db.addUserProfile(city, age, updatedHomepage, req.session.userID)
        .then(({ rows }) => {
            console.log("rows user profile", rows[0]);
            //console.log("rows password", rows[0].password);
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error appeared for query: ", err);
            res.redirect("/userprofile");
        });
});

// the register page is our front page
app.get("/", (req, res) => {
    res.redirect("/register");
});

//=================================EDIT USER PROFILE========================================
//edit user profiles
//GET request
app.get("/profile/edit", requireLoggedInUSer, (req, res) => {
    //res.render("edit");
    // get the current using the userID set in the cookie
    if (req.session.userID) {
        db.editUserProfile(req.session.userID)
            .then(({ rows }) => {
                console.log("all user data", rows);

                let userprofile = rows;
                res.render("edit", {
                    layout: "main",
                    userprofile: userprofile,
                });
            })
            .catch((err) => {
                console.log("error appeared for query: ", err);
                //res.redirect("/userprofile");
            });
    } else {
        //redirect user to register if cookies are missing
        res.redirect("/register");
    }
});

//edit user profiles
//POST request
app.post("/profile/edit", requireLoggedInUSer, (req, res) => {
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let password = req.body.password;
    let age = req.body.age;
    let city = req.body.city;
    let homepage = req.body.homepage;

    console.log("passwooooooord", password);

    let updatedHomepage;
    if (homepage.startsWith("http://") || homepage.startsWith("https://")) {
        updatedHomepage = homepage;
    } else {
        updatedHomepage = "https://" + homepage;
    }

    //check if password has been set
    if (password != "") {
        hashPass(password)
            .then((hashedPassword) => {
                return db.usersWithPwdUpdate(
                    firstname,
                    lastname,
                    email,
                    hashedPassword,
                    req.session.userID
                );
            })
            .then(() => {
                return db.updateUserProfiles(
                    city,
                    age,
                    updatedHomepage,
                    req.session.userID
                );
            })
            .then(() => {
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("error appeared for query: ", err);
                //res.redirect("/register");
            });
    } else {
        //update profile for users without password
        db.usersWithoutPwdUpdate(firstname, lastname, email, req.session.userID)
            .then(() => {
                return db.updateUserProfiles(
                    city,
                    age,
                    updatedHomepage,
                    req.session.userID
                );

                //res.redirect("/userprofile");
            })
            .then(() => {
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("error appeared for query: ", err);
                //res.redirect("/register");
            });
    }
});

//=================================THANKS==========================================
//render thanks handlebar
// declare empty global variable signatories to collect number of signatories
let signatories;
app.get("/thanks", requireLoggedInUSer, requireSignature, (req, res) => {
    if (req.session.userID) {
        // get the user id which is stored in req.session.userID globally as cookie

        db.getCurrentSignature(req.session.userID).then((currentSignature) => {
            let signatures = currentSignature.rows[0].signature;
            console.log(
                "+++++current signature++++++",
                currentSignature.rows[0].signature
            );
            return res.render("thanks", {
                layout: "main",
                signatories: signatories,
                currentSignature: signatures,
            });
        });
    } else {
        res.redirect("/petition");
    }
});

//=================================SIGNEES==========================================
//signers route
//render signers handlebar
app.get("/signers", requireLoggedInUSer, requireSignature, (req, res) => {
    db.getUserAttributes()
        .then(({ rows }) => {
            console.log("+++++++signers rows++++++", rows); // in rows property is the actual data
            const records = rows;
            signatories = records.reduce((rows) => rows + 1, 0);

            console.log("+++++++recooooooooooord+++++++++", records);

            console.log("signatories", signatories);

            res.render("signers", {
                layout: "main",
                records: records,
                signatories: signatories,
            });
        })
        .catch((err) => {
            console.log("error appeared for query: ", err);
        });
});

// here render the signers/city
app.get("/signers/:city", (req, res) => {
    // :city is a placeholder for the city
    let city = req.params.city;

    db.getUsersFromSameCity(city)
        .then(({ rows }) => {
            console.log("signees from same city", rows);

            res.render("filteredsigners", {
                layout: "main",
                records: rows,
            });
        })
        .catch((err) => {
            console.log("error appeared for query: ", err);
        });
});

// allow users to edit the information they have provided

//==========================PETITION==========================================
//petition route
//render petitions handlebar
app.get("/petition", requireLoggedInUSer, requireNoSignature, (req, res) => {
    res.render("petition", {});
});

//post request for petition
app.post("/petition", requireLoggedInUSer, requireNoSignature, (req, res) => {
    //let first_name = req.body.first_name;

    //let last_name = req.body.last_name;

    console.log("this is a test", req.body);
    //EncodedSignature is the value set in the input with hidden value

    let signature = req.body.EncodedSignature;

    console.log("this is a test", req.body);

    db.addSignature(req.session.userID, signature)
        .then(({ rows }) => {
            console.log("rows id", rows[0].id);

            req.session.signed = true;

            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("error appeared for query: ", err);
            res.redirect("/petition");
        });
});

//=================================DELETE SIGNATURE======================================
//delete user signature
// the register page is our front page
app.post("/delete", (req, res) => {
    db.deletecurrentSignature(req.session.userID)
        .then(({ rows }) => {
            //after deleting the signature, update the req.session.signature to null

            console.log("------signature rows----", rows);

            console.log("------before resetting----", req.session.signed);

            // req.session.signed is a cookie (true or false) that checks whether user has signed petition

            req.session.signed = false;

            console.log("++++++after resetting+++++", req.session.signed);

            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("error appeared for query: ", err);
            res.redirect("/petition");
        });
});

//=================================LOGOUT==========================================

// the register page is our front page
app.get("/logout", (req, res) => {
    console.log("&&&&&&&&&&&&&&&&&&&&&&", req.session);
    req.session = null;
    res.redirect("/login");
});
//start the express server
app.listen(8081, () => {
    console.log("server listening on port localhost:8081");
});
