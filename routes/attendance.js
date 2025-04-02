const express = require('express');
const {  generateAttendanceCode, markAttendance } = require('../controllers/attendanceController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();
const Course = require('../models/course');
const attendanceController = require('../controllers/attendanceController');


// router.post('/mark-attendance', verifyToken, markAttendance);
router.post('/mark', attendanceController.markAttendance);
router.post('/get-attendance-code', generateAttendanceCode);


// Route to fetch attendance for a student in a course
router.get('/summary/:courseId/:studentId', async (req, res) => {
    try {
        const { courseId, studentId } = req.params;

        // Find the course and filter attendance records
        const course = await Course.findById(courseId).populate('attendance.studentsPresent', 'name');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Total number of attendance sessions
        const totalSessions = course.attendance.length;

        // Total number of times the student was present
        const totalPresent = course.attendance.filter(record =>
            record.studentsPresent.some(student => student._id.toString() === studentId)
        ).length;

        res.json({ courseName: course.name, totalSessions, totalPresent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching attendance summary' });
    }
});



module.exports = router;