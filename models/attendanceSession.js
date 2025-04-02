const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    code: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    studentsMarked: [{ studentId: mongoose.Schema.Types.ObjectId, ip: String, timeStamp: Date }],
});

module.exports = mongoose.model('attendanceSession', attendanceSessionSchema);
