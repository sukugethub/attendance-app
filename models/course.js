const mongoose = require('mongoose');
const User = require('./user');
const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    attendance: [{
        date: { type: Date, required: true }, // Date of the attendance session
        studentsPresent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}], // List of students present
    },
],
});


module.exports = mongoose.model('Course', CourseSchema);