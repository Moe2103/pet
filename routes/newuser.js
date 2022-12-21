const express = require("express");
const router = express.Router();

const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });


const { hashPass, compare} = require("../encrypt");
const { insertDataIntoUsersDB, 
    insertDataIntoSignatureDB, 
    insertDataIntoUserProfilesDB, 
    selectJoinUsersAndSignaturesDBs,
    selectAllDataFromUserProfilesDB} = require('../db');

let showError = false;
const cohortName = "Mint";
const createdBy = 'Vladyslav Tsurkanenko';
const {noSignedInCookie, 
    withSignedInCookie, 
    noSignedInWithSignatureCookie} = require("../middleware");
const countries = require("../countries.json");
//                                                              GET
router.get("/petition", withSignedInCookie, noSignedInWithSignatureCookie, (req, res) => {
    res.render("1petition", {
        layout: "main",
        cohortName,
        createdBy,
    });
});
router.get("/register", withSignedInCookie, noSignedInWithSignatureCookie, (req, res) => {
    res.render("2register", {
        layout: "main",
        cohortName,
        createdBy,
        showError:false
    });
});

router.get("/signin", withSignedInCookie, noSignedInWithSignatureCookie, (req, res) => {
    res.render("3signin", {
        layout: "main",
        cohortName,
        createdBy,
        showError:false
    });
});
router.get("/user-profile", noSignedInCookie, noSignedInWithSignatureCookie, (req, res) => {
    res.render("4userprofile", {
        layout: "main",
        cohortName,
        countries,
        createdBy,
        showError:false
    });
});
router.get("/signature", noSignedInCookie, noSignedInWithSignatureCookie, (req, res) => {
    res.render("5signature", {
        layout: "main",
        cohortName,
        createdBy,
        showError:false
    });
});

//                                                                      POST
//registration post
router.post('/register', (req, res) => {
    let firstNameValuesSaved = req.body.firstNameValues;
    let secondNameValuesSaved = req.body.secondNameValues;
    let emailValueSaved = req.body.emailValue;
    let passwordValueSavedd = req.body.passwordValue;
    //
    hashPass(passwordValueSavedd).then((hashedPassword) => {
        if(firstNameValuesSaved !== '' && secondNameValuesSaved !== '' && emailValueSaved !== '' && passwordValueSavedd !== ''){
            insertDataIntoUsersDB(firstNameValuesSaved, secondNameValuesSaved, emailValueSaved, hashedPassword)
                .then((data)=>{
                    showError = false, 
                    req.session.signedIn = data.rows[0].id;
                    res.redirect('/user-profile');
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            res.render("2register", {
                layout: "main",
                cohortName,
                createdBy,
                showError: true
            });
        }
    });
});
//registration above
//signin post

let incorrectData = false;
let matchForUserIDs;
router.post('/signin', (req, res) => {
    let emailValueSavedS = req.body.emailValueS;
    let passwordValueSavedS = req.body.passwordValueS;
    if(emailValueSavedS !== '' && passwordValueSavedS !== ''){
        selectJoinUsersAndSignaturesDBs()
            .then((allData) => {
                matchForUserIDs = allData.rows.find(el => {
                    return el.email === emailValueSavedS;
                });
                if (matchForUserIDs){
                    let pwdOfUSer = matchForUserIDs.password;
                    compare(passwordValueSavedS, pwdOfUSer)
                        .then((boolean)=>{
                            if(boolean === true){
                                req.session.signedIn = matchForUserIDs.id;
                                if(matchForUserIDs.signature){
                                    req.session.signedWithSignature = matchForUserIDs.id;
                                    let matchForIDs;
                                    selectAllDataFromUserProfilesDB()
                                        .then((data) =>{
                                            matchForIDs = data.rows.find(el => {
                                                return el.user_id === req.session.signedIn;
                                            });
                                            console.log('match: ', matchForIDs);
                                            req.session.countryCode = matchForIDs.country;
                                            res.redirect('/thanks');
                                        })
                                        .catch((err) => {
                                            console.log(err);
                                        });
                                    
                                }else{
                                    res.redirect('/signature');
                                }
                            }else{
                                res.render("3signin", {
                                    layout: "main",
                                    cohortName,
                                    createdBy,
                                    incorrectData: true
                                });
                            }
                        });
                }else {
                    res.render("3signin", {
                        layout: "main",
                        cohortName,
                        createdBy,
                        incorrectData: true
                    });
                }
            });
    } else {
        console.log('first time if else');
        res.render("3signin", {
            layout: "main",
            cohortName,
            createdBy,
            showError: true
        });
    }
});
//signin above


const fs = require('fs');
const path = require('path');

//

//user-profile
let uploadTheImage = false;
router.post('/user-profile', upload.single('myphoto'), (req, res) => {
    let ageValueSaved = req.body.ageValue;
    let cityValueSaved = req.body.cityValue;
    let homepageValueSaved = req.body.homepageValue;
    let countryValue = req.body.country;
    console.log('cv: ', countryValue);
    let userID = req.session.signedIn;
    if (req.file){
        let pathValue = req.file.filename;
        const imageAsBase64 = fs.readFileSync(path.join(__dirname, '..', 'uploads', pathValue), 'base64');
        insertDataIntoUserProfilesDB(ageValueSaved, cityValueSaved, homepageValueSaved, countryValue, imageAsBase64, userID)
            .then((data)=>{
                uploadTheImage = false;
                req.session.userProfileID = data.rows[0].id;
                req.session.countryCode = countryValue;
                res.redirect('/signature');
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        res.render("4userprofile", {
            layout: "main",
            cohortName,
            countries,
            createdBy,
            uploadTheImage: true
        });
    }
});
//signature post
router.post('/signature', (req, res) => {
    let drawingCanvas = req.body.signature;
    let userID = req.session.signedIn;
    if(drawingCanvas){
        insertDataIntoSignatureDB(drawingCanvas, userID)
            .then((data)=>{
                showError = false,
                req.session.signedWithSignature = data.rows[0].id;
                res.redirect('/thanks');
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        res.render("5signature", {
            layout: "main",
            cohortName,
            createdBy,
            showError: true
        });
    }

});
//signature above


module.exports = router;