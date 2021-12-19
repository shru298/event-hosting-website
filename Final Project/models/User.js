const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {type: String, required: [true, ' First name cannot be empty']},
    lastName: {type: String, required: [true, 'Last name cannot be empty']},
    email: {type: String, required: [true, 'Email address cannot be empty'], unique: [true, 'This email address has been used']},
    password: {type: String, required: [true, ' Password cannot be empty']},
});

//Passord encryption is to be done before saving to DB. next here will pass the control from bcrypt to save. 
userSchema.pre('save', function(next){
    let user = this; //current details entered in sign up page
    if(!user.isModified('password'))//no password entry
        return next();
    bcrypt.hash(user.password, 10)//if password modified, hash it and store it
    .then(hash=>{
        user.password = hash; //replace password with hash value
        next();
    })
    .catch(err=>next(err));
});

// method to compare the entered password with the stored hash in db . 
userSchema.methods.comparePassword = function(inputPassword){
    let user = this;
    return bcrypt.compare(inputPassword, user.password);
}

module.exports = mongoose.model('User', userSchema);

