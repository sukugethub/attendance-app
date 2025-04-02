const Attendance = require('../models/attendance');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Course = require('../models/course');
const attendanceSession = require('../models/attendanceSession');

module.exports.generateAttendanceCode = async (req, res) => {
    try {
        const { teacherId, courseId } = req.query;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const attendanceCode = Math.floor(100000 + Math.random() * 900000); // Generate a random 4-digit code between 1000 and 9999 using Math.random()
        console.log("Your attendance code : "+ attendanceCode);
        const teacher = await User.findById(teacherId);

        const newAttendanceSession = new attendanceSession({
            teacherId: teacher._id,
            courseId: course._id,
            code: attendanceCode,
            date: Date.now(),
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });

        const savedAttendanceSession = await newAttendanceSession.save();
        console.log(savedAttendanceSession);
        req.flash('success', `Attendance code generated: ${attendanceCode}`);
        res.redirect(`/dashboard/teacher/${teacherId}`);
       
        // const attendanceSession = new AttendanceSession({

        // })
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating attendance code');
    }
    }

module.exports.markAttendance = async (req, res) => {
try {
    const { attendanceCode } = req.body;
    const { studentId, courseId} = req.query;

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
    if (session.students && session.students.some(student => student.studentId.toString() === studentId)) {
        req.flash('error', "Attendance already marked for this student");
        return res.redirect('/dashboard/student/' + studentId);
    }
    // Verify if the student is enrolled in the course
    const student = await User.findById(studentId);
    if (!student || !student.courses || !student.courses.includes(courseId)) {
        req.flash('error', "Student is not enrolled in this course");
        return res.redirect('/dashboard/student/' + studentId);
    }
    // Add the student to the attendance session
    session.students = session.students || [];
    session.students.push({ studentId, timestamp: new Date() });

    // Save the updated session
    await session.save();
    req.flash('success',` Attendance marked successfully for the course ${courseId}`);
    return res.redirect('/dashboard/student/' + studentId);
} catch (error) {
    console.error(error);
    res.status(500).send('Error marking attendance');
}
    res.send("Attendance marked successfully");
};