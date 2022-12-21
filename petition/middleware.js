//Apply to register route (both get and post request),
module.exports.requireLoggedInUSer = (req, res, next) => {
    if (!req.session.userID && req.url != "/register" && req.url != "/login") {
        return res.redirect("/register");
    }
    next();
};

module.exports.requireLoggedOutUSer = (req, res, next) => {
    if (req.session.userID) {
        return res.redirect("/petition");
    }
    next();
};

module.exports.requireNoSignature = (req, res, next) => {
    if (req.session.signed) {
        return res.redirect("/thanks");
    }
    next();
};

module.exports.requireSignature = (req, res, next) => {
    if (!req.session.signed) {
        return res.redirect("/petition");
    }
    next();
};
