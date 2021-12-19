const model = require ('../models/connection');
const Rsvp = require('../models/Rsvp');
const { DateTime } = require("luxon");

exports.index = (req,res)=>{                 
   model.find()
     .then(connections=>res.render('./connection/index', {connections}))
     .catch(err=>next(err));
 };
 
exports.new = (req,res)=>{
    res.render('./connection/new');
};

exports.create = (req,res, next)=>{
    let date = new Date(DateTime.now().toFormat("yyyy-LL-dd"));;
    let edate = new Date(req.body.end_date);
    let sdate = new Date(req.body.start_date);
    let stime = req.body.start_time;
    let etime = req.body.end_time;
   
    if(date.getDate() >= sdate.getDate()){
        req.flash('error', 'Selected date must be greater than today\'s date');
        res.redirect('back');    
    }
    else if(sdate.getDate() > edate.getDate()){
        req.flash('error', 'end date must be greater than start date');
        res.redirect('back'); 
    }
    
    else if(stime > etime){
        req.flash('error', 'end time must be greater than start time');
        res.redirect('back'); 
    }
    else{   
    let story = new model(req.body);
    story.author = req.session.user;
    story.save()//insert save
    .then(story => {
        req.flash('success', 'Event successfully Created!');
        res.redirect('/connections')
    })
    .catch(err=>{
        if (err.name ===  'ValidationError'){
            req.flash('error', err.message);
            res.redirect('back');
    }else{
    next(err);
    } //chnged for project 3
}); 
}};
exports.show = (req,res,next)=>{       
    let id = req.params.id;
    
    model.findById(id).populate('author', 'firstName lastName')
    .then(story=>{
        //console.log(story);
        if (story){
            story.start_date = DateTime.fromSQL(story.start_date).toFormat('LLLL dd, yyyy');
            story.end_date = DateTime.fromSQL(story.end_date).toFormat('LLLL dd, yyyy');
            story.start_time = DateTime.fromSQL(story.start_time).toFormat('hh:mm a');
            story.end_time = DateTime.fromSQL(story.end_time).toFormat('hh:mm a'); 

            Rsvp.countDocuments({ status: 'Yes', connection: id })
            .then(rsvpCount=>{
                return res.render('./connection/show', {story, rsvpCount});
            })
            .catch(err=>next(err));
        }else{
            let err = new Error('No Connection with id '+id+' found. Please re-check the entered id !');
            err.status=404;
            next(err);
        }
    })
    .catch(err => next(err));
};

exports.edit = (req,res,next)=>{                 
    let id = req.params.id;
    model.findById(id)
    .then(story => {
        if (story){
            res.render('./connection/edit',{story});
        }else{
            let err = new Error('No connection with id '+id+' found to edit.');
            err.status=404;
            next(err);
        }
    })
    .catch(err => next(err));
};  

exports.update = (req,res,next)=> {
    let story = req.body;
    
    let id = req.params.id;
    model.findByIdAndUpdate(id, story,{useFindAndModify: false, runValidators: true})
    .then(story=>{
        if(story) {
            req.flash('success', 'Event successfully updated!');
            res.redirect('/connections/'+id);
        }else { 
            let err = new Error('No connection with id '+id+' found to update. Please re-check the id !');
            err.status=404;
            next(err);
        }
    })
    .catch(err=> {
        if(err.name === 'ValidationError'){
            req.flash('error', err.message);
            res.redirect('back');
        }else{
            next(err);
        }
    });
};

exports.delete = (req,res,next)=> {
    let id = req.params.id;
    
    model.deleteOne({ _id: id })
    .then(story=>{
        if(story){
            req.flash('success', 'Event successfully deleted!');
            res.redirect('/connections');
        }else{
            let err = new Error('No Story with id '+id+' found to delete');
            err.status=404;
            return next(err);
        }
    })
    .catch(err => next(err));
};


exports.rsvp = (req, res, next) => {
    let attendees = req.session.user;
    let id = req.params.id;
    let status = req.body.status;

    model.findById(id)
    .then(story=>{
        if(story) {
            if(story.author==attendees){
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }else{
                Rsvp.updateOne({ connection: id, attendees: attendees }, 
                    { $set: { connection: id, attendees: attendees, status: status }}, 
                    { upsert: true })
                .then(rsvp=>{
                    if(rsvp) {
                        console.log(rsvp);
                        if(rsvp.upserted){
                            req.flash('success', 'Successfully created an RSVP for this connection!');
                        }else{
                            req.flash('success', 'Successfully updated an RSVP for this connection!');
                            console.log(rsvp);
                        }
                        res.redirect('/users/profile');
                    } else {
                        req.flash('error', 'There is some problem in creating an RSVP for this connection');
                        res.redirect('back');
                    }
                })
                .catch(err=> {
                    if(err.name === 'ValidationError'){
                        req.flash('error', err.message);
                        res.redirect('back');
                    }else{
                        next(err);
                    }
                });
            }
        } else {
            let err = new Error('Cannot find a connection with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
    
};

exports.deleteRsvp = (req, res, next) => {
    let id = req.params.id;
    Rsvp.findByIdAndDelete(id, {useFindAndModify: false})
    .then(rsvp =>{
        if(rsvp) {
            req.flash('success', 'RSVP has been sucessfully deleted!');
            res.redirect('/users/profile');
        } else {
            let err = new Error('Cannot find an RSVP with id ' + id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
};