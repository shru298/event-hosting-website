const express = require('express');
const controller = require('../controller/userController');
const {isGuest,isLoggedIn} = require('../middlewares/auth');
const { logInLimiter } = require('../middlewares/rateLimiters');
const { validateSignUp, validateLogIn, validateResult } = require('../middlewares/validator');
const router = express.Router();

router.get('/new', isGuest, controller.new);

router.post('/', isGuest,validateSignUp, validateResult, controller.create);

router.get('/login', isGuest, controller.getUserLogin);

router.post('/login',logInLimiter, isGuest, validateLogIn, validateResult, controller.login);

console.log(controller);
router.get('/profile', isLoggedIn, controller.profile);

//router.post('/login', controller.loginDetails);

router.get('/logoff', isLoggedIn, controller.logoff);

module.exports = router;