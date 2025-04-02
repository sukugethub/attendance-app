const Attendance = require('../models/attendance');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Course = require('../models/course');
const attendanceSession = require('../models/attendanceSession');

module.exports.generateAttendanceCode = async (req, res) => {
    try {
        const { teacherId, courseId } = req.query;

        // Check if the course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if an active attendance session already exists for this course and teacher
        const existingSession = await attendanceSession.findOne({
            courseId,
            teacherId,
            expiresAt: { $gt: new Date() } // Check if the session has not expired
        });

        if (existingSession) {
            req.flash('error', "An active attendance session already exists for this course.");
            return res.redirect(`/dashboard/teacher/${teacherId}`);
        }

        // Generate a new attendance code
        const attendanceCode = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit code
        console.log("Your attendance code: " + attendanceCode);

        // Find the teacher
        const teacher = await User.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Create a new attendance session
        const newAttendanceSession = new attendanceSession({
            teacherId: teacher._id,
            courseId: course._id,
            code: attendanceCode,
            date: Date.now(),
            expiresAt: new Date(Date.now() + 2 * 60 * 1000), // Set expiration time to 15 minutes from now
        });

        const savedAttendanceSession = await newAttendanceSession.save();
        console.log(savedAttendanceSession);

        req.flash('success', `Attendance code generated: ${attendanceCode}`);
        res.redirect(`/dashboard/teacher/${teacherId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating attendance code');
    }
};

module.exports.markAttendance = async (req, res) => {
    try {
        const { attendanceCode, courseId, studentId } = req.body;

        // Find the attendance session by courseId and attendanceCode
        const session = await attendanceSession.findOne({ courseId, code: attendanceCode });
        if (!session) {
            req.flash('error', "Invalid attendance code or course ID");
            return res.redirect('/dashboard/student/' + studentId);
        }

        // Check if the attendance code is expired
        if (new Date() > session.expiresAt) {
            req.flash('error', "Attendance code has expired");
            return res.redirect('/dashboard/student/' + studentId);
        }

        // Check if the student has already marked attendance
        if (session.studentsMarked && session.studentsMarked.includes(studentId)) {
            req.flash('error', "Attendance already marked for this student");
            return res.redirect('/dashboard/student/' + studentId);
        }

        // Add the student to the attendance session's `studentsMarked` field
        session.studentsMarked = session.studentsMarked || [];
        session.studentsMarked.push(studentId);
        await session.save();

        // Update the `attendance` field in the CourseSchema
        const course = await Course.findById(courseId);
        if (!course) {
            req.flash('error', "Course not found");
            return res.redirect('/dashboard/student/' + studentId);
        }

        // Find or create the attendance record for the current date
        const today = new Date().toISOString().split('T')[0]; // Get only the date part
        let attendanceRecord = course.attendance.find(record => record.date.toISOString().split('T')[0] === today);

        if (!attendanceRecord) {
            attendanceRecord = { date: new Date(), studentsPresent: [] };
            course.attendance.push(attendanceRecord);
        }

        // Add the student to the `studentsPresent` field
        attendanceRecord.studentsPresent.push(studentId);
        await course.save();

        req.flash('success', `Attendance marked successfully for the course ${course.name}`);
        return res.redirect('/dashboard/student/' + studentId);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error marking attendance');
    }
};

