const express = require('express');
const controller = require('../controller/connectionController');
const {isLoggedIn, isAuthor} = require('../middlewares/auth');
const {validateId} = require('../middlewares/validator');
const { validateConnection, validateResult } = require('../middlewares/validator');
const router = express.Router();

router.get('/',controller.index); 

router.get('/new', isLoggedIn, controller.new); 

router.post('/', isLoggedIn,validateConnection, validateResult,  controller.create);

router.get('/:id', validateId, controller.show);

router.get('/:id/edit', validateId, isLoggedIn, isAuthor, controller.edit);

router.put('/:id', validateId, isLoggedIn, isAuthor, validateConnection, validateResult,  controller.update);

router.delete('/:id', validateId, isLoggedIn, isAuthor, controller.delete);


//POST /connections/:id/rsvp: user response to rsvp
router.post('/:id/rsvp', validateId, isLoggedIn, controller.rsvp);

//DELETE /connections/rsvp/:id: delete the rsvp identified by id
router.delete('/rsvp/:id', validateId, isLoggedIn, controller.deleteRsvp);


module.exports = router;

