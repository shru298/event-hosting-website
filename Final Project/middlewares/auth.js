const connections = require('../models/connection');

exports.isGuest = (req,res,next)=> {
    if(!req.session.user)
        return next();
    else{
          req.flash('error','You are logged in already');
          return res.redirect('/users/profile');
      } 
};

exports.isLoggedIn = (req, res, next)=>{
    if(req.session.user)
        return next();
    else{
          req.flash('error','Please login first');
          return res.redirect('/users/login');
      }
};

exports.isAuthor = (req, res, next) => {
    let id = req.params.id;
    connections.findById(id)
    .then(story=> {
        if(story) {
            if(story.author == req.session.user){
                return next();
            } else{
                let err = new Error('Unauthorized to access the resources');
                err.status = 401;
                return next(err);
            }
        }else{
            let err = new Error("Cannot find a connection id " + id);
            err.status = 404;
            return next(err);
        }

    })
    .catch(err=>next(err));
};