const express = require('express');
const {  generateAttendanceCode, markAttendance } = require('../controllers/attendanceController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();
const attendanceController = require('../controllers/attendanceController');


// router.post('/mark-attendance', verifyToken, markAttendance);
router.post('/mark', attendanceController.markAttendance);
router.post('/get-attendance-code', generateAttendanceCode);

module.exports = router;