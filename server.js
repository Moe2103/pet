const express = require("express");
const app = express();
const path = require("path");

// Handlebars Setup
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
// End Set up

const {
    allQuery,
    allUsers,
    getSupportCount,
    getSigCount,
    getSignatures,
    updateUserProfil,
    deleteSig,
    editUser,
    allInfos,
    cityQuery,
    profileJoin,
    addInfo,
    registration,
    getUserByEmail,
    getAllSignatures,
    addSignature,
} = require("./db.js");
// Importing functions from bcrpy.js
const { hash, compare } = require("./bcrpt.js");

// Access to views
app.use(express.static("./views"));
// Access to static pages
app.use(express.static("./public"));

// Middleware
const {
    requireLoggedInUser,
    requireLoggedOutUser,
    requireNoSignature,
    requireSignature,
} = require("./middleware");

const petitionName = "Apple 30% Death Tax";

//---------------------------------------------------------------------------------------------
// Apply dfferent middlewares;

// -- Express.static for static files
// Do I need middleware to serve static files from a specific folder?
const staticMiddleware = express.static(path.join(__dirname, "projects"));
app.use(staticMiddleware);
//---------------------------------------------------------------------------------------------

// -- Express.urleencoded for ready the body of POST request
const urlEncodedMiddleware = express.urlencoded({ extended: false });
app.use(urlEncodedMiddleware);
//---------------------------------------------------------------------------------------------

// Setting up cookies
const cookieSession = require("cookie-session");
const { get } = require("https");
const { runInNewContext } = require("vm");
const { read } = require("fs");

app.use(
    cookieSession({
        secret: "Everyone loves Bananas",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

// Middleware
// app.use(requireLoggedInUser);
// app.use(requireLoggedOutUser);

//---------------------------------------------------------------------------------------------

// Create multplie routes for your express app;
// Set up handlebars for redirecting to registration page
app.get("/", (req, res) => {
    res.redirect("landing");
});

//---------------------------------------------------------------------------------------------
app.get("/landing", (req, res) => {
    res.render("landing", {
        layout: "main",
        petitionName,
    });
});

//---------------------------------------------------------------------------------------------

// // Later implement the redirect to log in while checking for cooky
// app.get("/", (req, res) => {
//     res.redirect("/login");
// });

///-------------------------------------------------------------------------------------------------------
/// 1_0. Get and Post request for registration
app.get("/registration", requireLoggedOutUser, (req, res) => {
    console.log("Curent User Id", req.session.userId);
    if (req.session.userId) {
        return res.redirect("/thanks");
    }
    res.render("registration", {
        layout: "main",
        petitionName,
    });
    // res.redirect("/petition");
});

app.post("/registration", requireLoggedOutUser, (req, res) => {
    const firstName = req.body.firstname;
    const lastName = req.body.lastname;
    const email = req.body.email;
    const password = req.body.password; /// hashing password
    hash(password)
        .then((hash) => {
            return registration(firstName, lastName, email, hash);
        })
        .then((result) => {
            // console.log(result);
            // const signatureId = result.rows[0].id;
            /////////////////// req.session.signaturesId = result.rows[0].id; //// Wrong Cookie set!!!
            // console.log("Body", req.body);
            req.session.userId = result.rows[0].id;
            console.log(req.session.userId);
            res.redirect("/petition");
        });
});

///-------------------------------------------------------------------------------------------------------
///-------------------------------------------------------------------------------------------------------
/// 1_1. Get and Post request for login
app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login", {
        layout: "main",
        petitionName,
    });
});

/// Change quers
app.post("/login", requireLoggedOutUser, (req, res) => {
    // console.log(req.body);
    getUserByEmail(req.body.email).then((data) => {
        // console.log("Data1", data.rows[0].password);
        // console.log("Data2", req.body.password);
        compare(req.body.password, data.rows[0].password).then((isMatch) => {
            console.log("Table Password: ", data.rows[0].password);
            // console.log("Typed Password: ", req.body.password);
            console.log("Check", isMatch);
            if (isMatch === true) {
                req.session.userId = data.rows[0].id;
                console.log(req.session.userId);

                // console.log("id", data.rows[0].id);
                // console.log("Req", req.session.signaturesId);
                console.log("Pass");
                if (data.rows[0].signature) {
                    req.session.signed = true;
                    // req.session.signaturesId = data.rows[0].id;
                    res.redirect("/thanks");
                } else {
                    res.redirect("/petition");
                }
            } else {
                res.render("login", {
                    layout: "main",
                });
            }
        }); /// catch error for password
    }); // catch error for email
});

///-------------------------------------------------------------------------------------------------------

// ---- One route for rendering the petition page wind handlebars
//2_0.Set up handlebars for app PETITION
app.get("/petition", requireNoSignature, (req, res) => {
    // req.session.userId = null;
    console.log("Curent User Id", req.session.userId);

    res.render("petition", {
        layout: "main",
        petitionName,
    });
});

////// !!!!! Add if statment to check if user is logged in !!!!!!! \\\\\\

// Post request for Signing
app.post("/petition", requireNoSignature, (req, res) => {
    // const user_id = req.session.signaturesId;
    const user_id = req.session.userId;
    const signatures = req.body.signatures;
    console.log("Siganture", req.body);
    addSignature(signatures, user_id).then((result) => {
        // console.log("Row", result.rows[0].id);
        // const signatureId = result.rows[0].id;
        // req.session.userId = result.rows[0].id;
        console.log(req.session.signaturesId);
        req.session.signaturesId = true;
        console.log(req.session.userId);

        // console.log("Cookies", result);
        res.redirect("/thanks");
    });
});
// Another post request for deletion
app.post("/delete", (req, res) => {
    deleteSig(req.session.userId).then((info) => {
        req.session.signaturesId = false;
        res.redirect("/thanks");
    });
});
///-------------------------------------------------------------------------------------------------------

///-------------------------------------------------------------------------------------------------------
// ---- One route for rendering the thanks page with handlebars
// -------- Make sure to get information about the number of signers
// 3_0. Set up handlebars for app THANKS
app.get("/thanks", requireLoggedInUser, (req, res) => {
    if (req.session.userId) {
        // console.log(req.session);
        // const user_id = req.body.userId;
        const user_id = req.session.userId;
        console.log("User", user_id);
        getSigCount().then((count) => {
            console.log(count);
            console.log("count", count.rows[0]);
            getSignatures(user_id).then(({ rows }) => {
                // console.log("Rows", sig);
                // console.log("All", result.signature);
                console.log("1", rows);
                res.render("thanks", {
                    layout: "main",
                    petitionName,
                    signature: rows,
                    // signature: sig.rows[0].signature,
                    count: count.rows[0].count,
                    // Number of use who signed
                });
            });
        });
    }
});

//// Move count to thanks and render all user info in signers
///-------------------------------------------------------------------------------------------------------

///-------------------------------------------------------------------------------------------------------
// ---- One route for rendering the signers page with handlebars;
// -------- Make sure to get all the signature data fromn the db before
// 4_0. Set up handlebars for app SIGNERS
app.get("/signers", requireLoggedInUser, (req, res) => {
    allQuery().then((info) => {
        // console.log("Info", info);
        // console.log("Info", info.rows[0]);
        let allSigners = info.rows;
        console.log("Info", allSigners);
        res.render("signers", {
            layout: "main",
            // allSigners:
            // firstname: info.rows[0].firstname,
            // lastname: info.rows[0].lastname,
            // age: info.rows[0].age,
            // city: info.rows[0].city,
            // linkedIn: info.rows[0].linkedIn,
            // count: signs.length,
            // count: allSigners.signature.length,
            // signers: info.rows,
            allSigners,
        });
    });
});

app.get("/signers/:city", requireLoggedInUser, (req, res) => {
    const city = req.params.city;
    // console.log("data", req.params.cityInfo);
    cityQuery(city).then((info) => {
        let allSigners = info.rows;
        console.log(req.params.city);
        res.render("signers", {
            layout: "main",
            // signers: info.rows,
            city: req.params.city,
            allSigners,
        });
    });
});

/// DB query for all signers by city

///-------------------------------------------------------------------------------------------------------

///-------------------------------------------------------------------------------------------------------
//2_1.Set up handlebars for app adding additioal profile information

app.get("/addInfo", requireLoggedInUser, (req, res) => {
    res.render("addInfo", {
        layout: "main",
        petitionName,
    });
});

app.post("/addInfo", requireLoggedInUser, (req, res) => {
    const city = req.body.city;
    const age = req.body.age;
    const linkedIn = req.body.linkedIn;
    // const userId =  result.rows[0].id;
    // req.session.signaturesId = true;
    const userId = req.session.userId;
    addInfo(city, age, linkedIn, userId).then((result) => {
        res.redirect("/petition");
    });
});

// ---- One route for POSTing petition data -> Update DB accordingly
///-------------------------------------------------------------------------------------------------------

// app.post("/cityInfo", (req, res) => {

// });
///-------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------
// 6.0 Edit profil

app.get("/editPage", requireLoggedInUser, (req, res) => {
    allInfos(req.session.userId).then((data) => {
        // console.log("Data from user", req.session.firstName)

        // console.log("Saved Data", req.session);
        res.render("editPage", {
            layout: "main",
            // user: rows,
            user: data.rows[0],
            // Adding prefedined values
        });
    });
});

app.post("/editPage", requireLoggedInUser, (req, res) => {
    const user_id = req.session.userId;
    const { firstname, lastname, email, city, age, linkedIn } = req.body;
    console.log(req.body);
    editUser(firstname, lastname, email, user_id).then((data) => {
        updateUserProfil(city, age, linkedIn, user_id).then((data) => {
            // console.log("rows", rows);
            // console.log("user_id", req.session.user_id);
            /// if else statment to check for password and redirect if not to edit; new db.query
            res.redirect("/editPage");
        });
    });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

//---------------------------------------------------------------------------------------------

// Server Listening
app.listen(8089, () => {
    console.log("Express server is running on localhost:8089");
});
