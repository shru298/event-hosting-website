const model = require('../models/User');
const connections = require('../models/connection');
const Rsvp = require('../models/Rsvp');
const { rsvp } = require('./connectionController');

exports.new = (req,res)=>{
    res.render('./user/new');
};
exports.create = (req,res,next) => {
    let user = new model(req.body); // get the entered details from the sign up form.
    user.save() //store the details of new user to DB 
    .then(user => {
        req.flash('success','User Successfully registered! Please login');
        res.redirect('/users/login');
    })
    .catch(err=>{
        if (err.name === 'ValidationError'){
            req.flash('error',err.message);// general error messages. Eg: if an input field not filled and the new user registration is submitted
            return res.redirect('/users/new');
        }
        if(err.code === 11000) { //duplicate key, 11000 error will populate. Eg: registering with already existing email address
            req.flash('error','Email address already used by other User! Please provide a different email address');
            return res.redirect('/users/new');
        }
        next(err);
    });
};


exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
}


//get details from login form 
exports.login = (req, res, next)=>{
    //authenticate user's login request
        let email = req.body.email;
        let password = req.body.password;//takes the login password from login form through user model 
        model.findOne({ email: email }) //compares the email from DB and entered email
        .then(user => {
            if (!user) {
                //console.log('wrong email address');
                req.flash('error', 'Not Registered with this email Id, Please Check !');  
                res.redirect('/users/login');
            } else {
                user.comparePassword(password)//comparePassword() method returns promise so use then and catch
                .then(result=>{
                    if(result){        
                        req.session.user = user._id;//store user's id in session
                        req.session.firstName = user.firstName;     
                        req.session.lastName = user.lastName;                  
                        req.flash('success', 'You have successfully logged in!');
                        res.redirect('/users/profile');
                } else {
                    req.flash('error', 'Wrong password');      
                    res.redirect('/users/login');
                }
                })
                .catch(err => next(err));     
            }     
        })
        .catch(err => next(err));
};

exports.profile = (req,res, next)=>{
    let id = req.session.user;
    ////let name = req.session.first_name;
    ////console.log(req.flash());// flush or retrieve the message
    Promise.all([model.findById(id), connections.find({author: id}),Rsvp.find({attendees: id}).populate('connection')])
    .then(results=>{
        const [user, connections, rsvps] = results;
        console.log(rsvps);
        res.render('./user/profile', {user, connections, rsvps});
    
    })
    .catch(err=>next(err));
};


exports.logoff = (req,res,next) => {
    req.session.destroy(err=>{
        if(err)
            return next(err);
        else
            res.redirect('/');
    });
};



