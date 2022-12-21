const bcrypt = require("bcryptjs");

exports.hash = (password) => {
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(password, salt);
    });
};

exports.compare = bcrypt.compare;

/*
const checkLogged = (req, res, next) => {
    // Check if req.session.user_id has a value
    if (req.session.user_id && req.session.user_id.length > 0) {
        // If req.session.user_id has a value, proceed to the next middleware or route handler
        next();
    } else {
        // If req.session.user_id does not have a value, return a response indicating that the user is not authenticated
        res.status(401).json({ error: "Unauthorized" });
    }
};

const checkSigned = (req, res, next) => {
    // Check if req.session.signed is true
    if (req.session.signed) {
        // If req.session.signed is true, proceed to the next middleware or route handler
        next();
    } else {
        // If req.session.signed is not true, return a response indicating that the user is not authenticated
        res.status(401).json({ error: "Unauthorized" });
    }
};

app.use(checkLogged);
app.use(checkSigned);

app.get("/signed", (req, res) => {
    // This route handler will only be executed if the checkLogged and checkSigned middleware functions above allow the request to proceed
    // ...
});

*/
