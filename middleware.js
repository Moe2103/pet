module.exports.noSignedInCookie = (req, res, next) => {
    if (!req.session.signedIn && req.url !== "/register" && req.url !== "/signin") {
        return res.redirect("/petition");
    }
    next();
};

module.exports.withSignedInCookie = (req, res, next) => {
    if (req.session.signedIn) {
        return res.redirect("/signature");
    }
    next();
};

module.exports.noSignedInWithSignatureCookie = (req, res, next) => {
    if (req.session.signedWithSignature) {
        return res.redirect("/thanks");
    }
    next();
};

module.exports.withSignedInWithSignatureCookie = (req, res, next) => {
    if (!req.session.signedWithSignature) {
        return res.redirect("/signature");
    }
    next();
};
