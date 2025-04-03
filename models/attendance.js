const session = require("express-session");
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  courses: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      attendance: [
        {
          sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AttendanceSession",
          },
          present: { type: Boolean, default: false },
          date: { type: Date, default: Date.now },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Attendance", attendanceSchema);
