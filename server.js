// GENERAL SET UP

const express = require("express");
const spicedPg = require("spiced-pg");
const app = express();
const path = require("path");
const cookieSession = require("cookie-session");
const {} = require("./middleware")
const PORT = 3000

// connecting other files
const db = require("./db");
const crypt = require("./bcrypt.js")
const { requireLoggedInUser, requireLoggedOutUser, requireNoSignature, requireSignature } = require("./middleware.js")
// const getUrl = require("./public/script.js") 

// handlebars setup
const { engine } = require("express-handlebars");
const bcrypt = require("bcryptjs/dist/bcrypt");
const { nextTick } = require("process");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.static("./public"));
app.use(express.static("./views"));
app.use(express.static("./"));
app.use(express.urlencoded({extended: false}));

app.use(cookieSession( {
    secret: `music will be the answer`,
    maxAge: 1000 * 60 * 60 * 24 * 14
}));


// GET REQUEST

app.get("/petition", (req, res) => {
    res.render("petition");
});

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("register");
});

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login");
});

app.get("/profile", requireLoggedInUser, (req,res) => {
    res.render("profile");
});

app.get("/sign", requireLoggedInUser, requireNoSignature, (req, res) => {
    res.render("sign");
});

app.get("/thanks", requireLoggedInUser, requireSignature, (req, res) => {
    db.getAllSignatures()
    .then(data => {
        console.log("numero di firme", data.rows.length)
        res.render("thanks", {
            firme: data.rows.length
        })
    })
    .catch(err => {
        console.log("error appeared for query select getAllSig:", err);
    })  
});

app.get("/signers", requireLoggedInUser, requireSignature, (req, res) => {
    db.getAllSigners()
    .then(tabs => {
        console.log(tabs)
        res.render("signers", {
            chifirma: tabs.rows
        });    
    })
    .catch(err => {
        console.log("error appeared for query select getAllSig:", err);
    })  
}); 

app.get("/editprofile", requireLoggedInUser, (req, res) => {
    console.log(req.session.userId)
    db.getProfile(req.session.userId)
    .then (data => {
    // console.log(data)
        res.render("editprofile", {
        firstname: data.rows[0].first,
        lastname: data.rows[0].last,
        // email: data.rows[0].email,
        // password: data.rows[0].password,
        city: data.rows[0].city,
        age: data.rows[0].age,
        homepage: data.rows[0].homepage
        })
    })
});

// app.get("/city", (req, res) => {
//     // console.log(req.params.url)
//     db.getSignersbycity()
//     res.render("signersbycity", {
//     })
// });

app.get("/delete", requireLoggedInUser, requireSignature, (req, res) => {
    res.render("delete")
});

app.get("/deleted", requireLoggedInUser, requireSignature, (req, res) => {
    db.deleteSig(req.session.userId)
    .then(data => {
    console.log(data)
    req.session.userId = null
    res.render("petition", {
        deleted: true
    })
    })
});

app.get("/logout", requireLoggedInUser, (req,res) => {
    req.session.userId = null
    res.redirect("/")
});


// POST REQUEST

app.post("/register", (req, res) => {
    // console.log("password di registrazione", req.body.password)
    //  hash the password before saving to the Database
    crypt.hash(req.body.password)
    .then(hashedPsw => {
        console.log(hashedPsw)
        return db.addUser(req.body.firstname, req.body.lastname, req.body.email, hashedPsw)
    })
    .then(data => { 
        // console.log("data.rows", data.rows)
        // save cookies and redirect to profile page
        req.session.userId = data.rows[0].id
        console.log("stanno funzionando i biscotti?", req.session.userId)
        res.redirect("/profile")
    })
    .catch(err => {
        console.log("error appeared for post req register:", err);
        res.render("register", {
            ops: true
        })
    })  
});

app.post("/login", (req, res) => {
    // check by the email if the user exists in your database
    // if he/she exists then compare if the password matches
    // go to the signatures table to see if this user already signed
    console.log(req.body.email)
    db.checkEmail(req.body.email)
    .then(data => {
        // console.log("query", data.rows)
        if (data.rows.length === 1) {
            // console.log("email", data.rows[0].email)
            // console.log("password", data.rows[0].password)
            crypt.compare(req.body.password, data.rows[0].password)
            .then(bool => {
                // console.log("controllo password", bool)
                if (bool) {
                    console.log("id users", data.rows[0].id)
                    db.checkSig(data.rows[0].id)
                    .then(sig => {
                        console.log("geesese", sig)
                        req.session.userId = data.rows[0].id
                        if (sig.rows.length === 1) {
                            // if the user has signed already redirect to thanks page
                            req.session.signatureId = true
                            res.redirect("/thanks")
                        } else {
                            req.session.signatureId = false
                            res.redirect("/sign")
                        }
                    })
                } else { 
                    res.render("login", {
                        ops: true
                    }) 
                }
            })
        } else { 
            res.render("register", {
                ops: true
            })
        }
    })    
    .catch(err => {
        console.log("error appeared for post login:", err);
        res.render("login", {
            ops: true
        })
    })
});

app.post("/profile", (req, res) => {
    // save the data in the profiles table
    db.addProfile(req.body.city, req.body.age, req.body.homepage, req.session.userId)
    .then(data => {
        console.log(data)
        req.session.signatureId = false
        res.redirect("/sign")
    })  
    .catch(err => {
        console.log("error appeared for post req profile:", err);
        res.render("profile", {
            ops: true
        }) 
    })
});

app.post("/sign", (req,res) => {
    // getUrl.signat()
    const signature = "sig";
    console.log("firmato!")
        db.addSignatures(signature, req.session.userId)
        .then(signature => {
            console.log(signature)
            req.session.signatureId = true
            res.redirect("/thanks")
        })    
});

app.post("/editprofile", (req,res) => {
    // update profiles and users tables
    crypt.hash(req.body.password)
    .then(hashedPsw => {
        console.log(hashedPsw)
        Promise.all([
        db.updateUser(req.body.firstname, req.body.lastname, hashedPsw, req.session.userId),
        db.updateProfile(req.body.city, req.body.age, req.body.homepage, req.session.userId)
    ])
    })
    // db.updateProfile(req.body.firstname, req.body.lastname, req.body.email, req.body.password, req.body.city, req.body.age, req.body.homepage, req.session.userId)
    .then(data => {
        // console.log("data:", data.rows[0])
        if (req.session.signatureId === true) {
            // console.log(data)
            res.redirect("/thanks")
        } else {
        res.redirect("/sign")
        }
    })
    .catch(err => {
        console.log("error appeared for post req editprofile:", err);
        res.redirect("/editprofile") 
    })
});

app.listen(process.env.PORT || PORT, () => {
    console.log(`running at ${PORT}`)
});