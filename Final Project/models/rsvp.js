const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rsvpSchema = new Schema({
    attendees: {type: Schema.Types.ObjectId, ref: 'User'},
    connection: {type: Schema.Types.ObjectId, ref: 'Connection'},
    status: {type: String, required: [true, 'Status is required']},
},
{timestamps: true}
);

module.exports = mongoose.model('Rsvp', rsvpSchema);


