//require app 
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const User = require('./models/User');
const session = require('express-session');
const MongoStore = require('connect-mongo'); //persistent session store
const flash = require('connect-flash');
const connectionRoutes = require('./routes/connectionRoutes.js'); 
const mainRoutes = require('./routes/mainRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

//create app 
const app = express();

//configure app 
let port = 3000;
let host = 'localhost';
app.set('view engine','ejs');

//connect to db
mongoose.connect('mongodb://localhost:27017/demos',
                {useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    app.listen(port, host, ()=>{
    console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));

//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

//middleware for session and cookies
app.use(session({
    secret: 'weioadhcurbbseduaiajjhugh', //to encrypt the cookies in header
    resave: false,
    saveUninitialized: false, // for a new req with auto-cookies comes in, it creates a new session
    cookie:{maxAge: 60*60*1000}, //in millisecond , for 1 hour. For 4 hrs = 4*60*60*1000
    store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/demos'})// if session is created, the session will be addedd to demos DB . Collection name by default is "session". This can also be resetted in db. recommended for production mode

}));

// include after session is created . flash is stored in session
app.use(flash());

app.use((req,res, next)=>{ 
      res.locals.user = req.session.user||null;
      res.locals.firstName = req.session.firstName||null;
      res.locals.lastName = req.session.lastName||null;
      res.locals.successMessages = req.flash('success'); // instead of using flash in each req handler like /login, /profile, we can use it in the middle ware like this 
      res.locals.errorMessages = req.flash('error'); 
      next();
  });




//General Site Navigations - home page, about, contact , sign In and Singup - interim 
app.use('/', mainRoutes); // home page, sign in and sign up
//app.use('/about', mainRoutes); // about page
//app.use('/contact', mainRoutes); // contact page

app.use('/connections', connectionRoutes); 
app.use('/users', userRoutes);

//404 error handler
app.use((req,res, next) => {
    let err = new Error('The Server Cannot locate' + req.url);
    err.status=404;
    next(err);
});


// 500 error handler
app.use((err, req, res, next)=> {
    console.log(err.stack);
    if (!err.status){
        err.status = 500;
        err.message=("Internal server error");
    }
    res.status(err.status);
    res.render('error', {error:err});
});



