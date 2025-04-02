const mongoose = require('mongoose');

const AttendanceSessionSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    code: { type: String, required: true },
    date: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    studentsMarked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Track students who marked attendance
});

module.exports = mongoose.model('AttendanceSession', AttendanceSessionSchema);