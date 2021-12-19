const mongoose = require('mongoose');
const Rsvp = require('./Rsvp');
const Schema = mongoose.Schema;

const connectionSchema = new Schema({
    category:{type: String, required: [true, 'Category is required']},
    author: {type: Schema.Types.ObjectId, ref:'User'},
    title:{type: String, required: [true, 'title is required']},
    sub_title:{type: String, required: [true, 'Sub-title is required']},
    details:{type: String, required: [true, 'Details is required'], minLength: [10,'Please provide details of atleast 10 characters']}, 
    start_date:{type: String, required: [true, 'Start date is required']},
    end_date:{type: String, required: [true, 'end date is required']},
    start_time:{type: String, required: [true, 'Start time is required']},
    end_time:{type: String, required: [true, 'end time is required']},
    location:{type: String, required: [true, 'location is required']}, 
    image:{type: String, required: [true, 'Category is required']}
},
{timestamps: true}
);

connectionSchema.pre('deleteOne', function(next) {
    let id = this.getQuery()['_id'];
    Rsvp.deleteMany({ connection: id}).exec();
    next();
});

//collection name is connections in the database
module.exports = mongoose.model('Connection', connectionSchema);
