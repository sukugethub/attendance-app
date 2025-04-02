const express = require('express');
const { getTeacherDashboard, startAttendance, checkProxies, getAttendanceByStudent, generateAttendanceCode } = require('../controllers/teacherController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Teacher dashboard
// router.get('/dashboard', verifyToken, getTeacherDashboard);

// Generate attendance code
// router.post('/generate-code', verifyToken, generateAttendanceCode);

// // View attendance by student
// router.post('/view-attendance', verifyToken, getAttendanceByStudent);

// // Start attendance session
// router.post('/start-attendance', verifyToken, startAttendance);

// // Check proxies
// router.get('/check-proxies', verifyToken, checkProxies);

module.exports = router;