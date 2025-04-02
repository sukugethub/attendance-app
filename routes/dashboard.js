const express = require('express');
const { getStudentDashboard , getTeacherDashboard, getAdminDashboard } = require('../controllers/dashboardController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/student/:id', verifyToken, getStudentDashboard );
router.get("/teacher/:id", verifyToken, getTeacherDashboard);
router.get("/admin/:id", verifyToken, getAdminDashboard);


module.exports = router;
