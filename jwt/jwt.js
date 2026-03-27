const jwt = require('jsonwebtoken');

exports.jwtgen = function (username) {
    return jwt.sign(
        { username: username },
        process.env.JWT_SECRET
    );
};

exports.jwtVerify = function (token) {
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        return true;
    } catch (err) {
        return false;
    }
};