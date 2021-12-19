const rateLimit = require('express-rate-limit');

exports.logInLimiter = rateLimit({
    windowMs : 60*1000,
    max: 5,
    handler : (req, res, next) => {
        let err = new Error('You have tried multiple logins at a time. Please Try again later');
        err.status = 429; 
        return next(err);
    }
});
