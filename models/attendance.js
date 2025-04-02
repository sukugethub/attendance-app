const mongoose = require('mongoose');
const User = require('./user');

const AttendanceSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attendace: [
        {
            present: { type: Boolean, default: false },
            date: { type: Date, default: Date.now },
        }
    ]
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
