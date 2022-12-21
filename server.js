const express = require("express");
const app = express();
const {
    getSignature,
    addSignature,
    addUsers,
    addUsers_profile,
    getTables,
    getCity,
    getUserbyId,
    updateUserbyId,
    updateUserProfilesbyId,
} = require("./db.js");

const cookieSession = require("cookie-session");
const { hashPass, compare } = require("./encrypt");
let warning = false;
//let signature;
//const cookieParser = require("cookie-parse");

//app.use(cookieParser());

//handlebars Setup
const { engine } = require("express-handlebars");
const { hassPass } = require("./encrypt.js");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

//End of setup

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(express.static((__dirname, "./public")));
app.use(express.urlencoded({ extended: false }));
//app.use(express.static());

app.get("/", (req, res) => {
    res.redirect("/register");
});
app.get("/petition", (req, res) => {
    console.log(req.session.userid);
    res.render("petition", {
        layouts: "main",
        warning: false,
    });
});

app.get("/thanks", (req, res) => {
    getTables()
        .then((data) => {
            console.log(data.rows.length);
            console.log(req.session.signatureId);
            const userData = data.rows.find((row) => {
                return row.id === req.session.userid;
            });

            imgUrl = userData.signature;

            res.render("thanks", {
                layouts: "main",
                imgUrl,
                total: data.rows.length,
            });
        })
        .catch((error) => {
            console.log(error);
        });
});

app.get("/signers", (req, res) => {
    console.log(req.session.userid);
    getTables()
        .then((data) => {
            console.log(data);
            res.render("signers", {
                layouts: "main",
                signers: data.rows,
            });
        })
        .catch((error) => {
            console.log(`error found`, error);
        });
});

app.get("/register", (req, res) => {
    res.render("register", {
        layouts: "main",
    });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layouts: "main",
    });
});

app.post("/profile", (req, res) => {
    let age = req.body.age;
    let city = req.body.city;
    let homepage = req.body.homepage;
    const resultpg = { age, city, homepage };
    console.log(resultpg);
    const userid = req.session.userid;
    console.log(userid);
    addUsers_profile(age, city, homepage, userid).then((resultpg) => {
        console.log(resultpg);
        res.redirect("/petition");
    });
    //req.session.userid = resultpg.rows[0].id;
});

app.post("/register", (req, res) => {
    let firstNname = req.body.fname;
    let lastNname = req.body.lname;
    let email = req.body.email;
    let password = req.body.password;
    const result = { firstNname, lastNname, email, password };
    console.log(result);
    hashPass(password).then((hashedPassword) => {
        console.log(hashedPassword);
        if (
            firstNname !== "" &&
            lastNname !== "" &&
            email !== "" &&
            !!password
        ) {
            addUsers(firstNname, lastNname, email, hashedPassword)
                .then((result) => {
                    console.log(result);
                    req.session.userid = result.rows[0].id;
                    res.redirect("/profile/");
                })
                .catch((err) => {
                    console.log(`error found`, err);
                });
        }
    });
});

// app.get("/profile", (req, res) => {
//     res.render("profile", {
//         layouts: main,
//     })
// })

app.get("/login", (req, res) => {
    res.render("login", {
        layouts: "main",
    });
});

app.post("/login", (req, res) => {
    le;
});

app.post("/petition", (req, res) => {
    let signature = req.body.signature;
    //let passwd = req.body.password;
    const data = { signature };
    console.log(data);
    const userid = req.session.userid;
    if (!!signature) {
        addSignature(signature, userid)
            .then((data) => {
                console.log(data);
                warning === false;
                req.session.signatureId = data.rows[0].id;
                console.log(data.rows[0].id);
                res.redirect("/thanks/");
            })
            .catch((err) => {
                console.log(`error found`, err);
            });
    } else {
        res.render("petition", {
            warning: true,
        });
    }
});

app.get("/signers/:useCity", (req, res) => {
    const city = req.params.useCity;
    const data = getCity(city).then((data) => {
        console.log(req.params.useCity);
        console.log(data);
        res.render("signerspagebycity", {
            layouts: "main",
            signers: data.rows,
            city: req.params.useCity,
        });
    });
});

app.get("/edit", (req, res) => {
    getUserbyId(req.session.userid).then((data) => {
        console.log(data.rows);
        res.render("edit", {
            layouts: "main",
            user: data.rows[0],
        });
    });
});

app.post("/edit", (req, res) => {
    let firstname = req.body.fname;
    let lastname = req.body.lname;
    let email = req.body.email;
    let passwd = req.body.password;
    let age = req.body.age;
    let city = req.body.city;
    let homepage = req.body.homepage;
    const newData = { firstname, lastname, email, passwd, age, city, homepage };
    console.log(newData);
    const userid = req.session.userid;
    updateUserbyId(userid, firstname, lastname, email)
        .then((date) => {
            console.log(data);
        })
        .catch((error) => {
            console.log(`Error found`, error);
        });
    updateUserProfilesbyId(userid, age, city, homepage).then((data) => {
        console.log(data);
    });
    res.redirect("/thanks");
});


app.post("/logout", (req, res) => {
    req.session.userid = null;
    res.redirect("/register");
});
app.listen(
    process.env.PORT || 8080,
    console.log("App is running on port 8080")
);
