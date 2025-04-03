const express = require("express");
const {
  generateAttendanceCode,
  markAttendance,
  getAttendance,
} = require("../controllers/attendanceController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { get } = require("mongoose");

const router = express.Router();

router.post(
  "/mark-attendance/:courseId/:studentId",
  verifyToken,
  markAttendance
);
router.post("/get-attendance-code", verifyToken, generateAttendanceCode);
router.get("/get-attendance/:studentId/:courseId", verifyToken, getAttendance);

module.exports = router;
