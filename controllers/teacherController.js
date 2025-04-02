const Course = require('../models/course');
const AttendanceSession = require('../models/attendanceSession');

const User = require('../models/user');
const crypto = require('crypto');


// Generate unique attendance code
module.exports.generateAttendanceCode = async (req, res) => {
    try {
        const { courseId } = req.body;
        const code = crypto.randomBytes(4).toString('hex'); // Generate a unique 8-character code
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Code expires in 15 minutes

        const attendanceSession = new AttendanceSession({
            teacherId: req.user.id,
            courseId,
            code,
            date: new Date(),
            expiresAt,
        });

        await attendanceSession.save();
        res.json({ success: true, code, expiresAt });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating attendance code');
    }
};

// View attendance by student
module.exports.getAttendanceByStudent = async (req, res) => {
    try {
        const { name, email, courseId } = req.body;

        const student = await User.findOne({ name, email, role: 'student' });
        if (!student) {
            return res.status(404).send('Student not found');
        }

        const course = await Course.findById(courseId).populate({
            path: 'attendance',
            match: { 'studentsPresent': student._id },
        });

        res.render('student-attendance', { student, course });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching attendance');
    }
};