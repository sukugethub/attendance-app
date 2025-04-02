const express = require('express');
const { markAttendance } = require('../controllers/studentController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/mark-attendance', verifyToken, markAttendance);

module.exports = router;
