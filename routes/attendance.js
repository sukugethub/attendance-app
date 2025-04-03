const express = require("express");
const {
  generateAttendanceCode,
  markAttendance,
} = require("../controllers/attendanceController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/mark-attendance/:courseId/:studentId",
  verifyToken,
  markAttendance
);
router.post("/get-attendance-code", generateAttendanceCode);

module.exports = router;
