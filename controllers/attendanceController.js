const Attendance = require("../models/attendance");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Course = require("../models/course");
const attendanceSession = require("../models/attendanceSession");

module.exports.generateAttendanceCode = async (req, res) => {
  try {
    const { teacherId, courseId } = req.query;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const attendanceCode = Math.floor(100000 + Math.random() * 900000); // Generate a random 4-digit code between 1000 and 9999 using Math.random()
    console.log("Your attendance code : " + attendanceCode);
    const teacher = await User.findById(teacherId);
    // Check if a non-expired attendance code already exists for the course
    const existingSession = await attendanceSession.findOne({
      courseId: course._id,
      expiresAt: { $gt: new Date() }, // Ensure the session has not expired
    });

    if (existingSession) {
      req.flash(
        "error",
        "An active attendance code already exists for this course: " +
          existingSession.code
      );
      return res.redirect(`/dashboard/teacher/${teacherId}`);
    }
    const newAttendanceSession = new attendanceSession({
      teacherId: teacher._id,
      courseId: course._id,
      code: attendanceCode,
      date: Date.now(),
      expiresAt: new Date(Date.now() + 2 * 60 * 1000), // Expires 2 minutes from the current time
    });

    const savedAttendanceSession = await newAttendanceSession.save();
    console.log(savedAttendanceSession);
    req.flash("success", `Attendance code generated: ${attendanceCode}`);
    res.redirect(`/dashboard/teacher/${teacherId}`);

    // const attendanceSession = new AttendanceSession({

    // })
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating attendance code");
  }
};

module.exports.markAttendance = async (req, res) => {
  try {
    const { code } = req.body;
    const { courseId, studentId } = req.params; // // Extract courseId and studentId from the request parameters

    // Find the attendance session by courseId and attendanceCode
    const session = await attendanceSession.findOne({
      courseId,
      code,
    });

    if (!session) {
      req.flash("error", "Invalid attendance code or course ID");
      return res.redirect("/dashboard/student/" + studentId);
    }

    // Check if the attendance code is expired
    if (new Date() > session.expiresAt) {
      req.flash("error", "Attendance code has expired");
      return res.redirect(`/dashboard/student/${studentId}`);
    }

    // Check if the student has already marked attendance
    if (
      session.studentsMarked &&
      session.studentsMarked.some(
        (student) => student.studentId.toString() === studentId
      )
    ) {
      req.flash("error", "Attendance already marked for this student");
      return res.redirect("/dashboard/student/" + studentId);
    }
    // Verify if the student is enrolled in the course
    const student = await User.findById(studentId);
    if (!student || !student.courses || !student.courses.includes(courseId)) {
      req.flash("error", "Student is not enrolled in this course");
      return res.redirect("/dashboard/student/" + studentId);
    }
    // Add the student to the attendance session
    session.studentsMarked = session.studentsMarked || [];
    session.studentsMarked.push({ studentId, timestamp: new Date() });
    // Update the attendance details of the student
    let studAttRecord = await Attendance.findOne({ studentId });

    if (!studAttRecord) {
      // If no attendance record exists, create a new one
      studAttRecord = new Attendance({
        studentId,
        courses: [
          {
            courseId,
            attendance: [],
          },
        ],
      });
    }

    // Add the attendance session to the student's attendance record
    // Find the course in the student's attendance record
    const courseAttendance = studAttRecord.courses.find(
      (course) => course.courseId.toString() === courseId
    );

    if (courseAttendance) {
      // Add the attendance session to the existing course's attendance array
      courseAttendance.attendance.push({
        sessionId: session._id,
        date: new Date(),
        present: true, // Mark the student as present
      });
    } else {
      // If the course is not found, add a new course with the attendance session
      studAttRecord.courses.push({
        courseId,
        attendance: [
          {
            sessionId: session._id,
            date: new Date(),
          },
        ],
      });
    }

    // Save the updated attendance record
    await studAttRecord.save();

    // Save the updated session
    await session.save();
    req.flash(
      "success",
      ` Attendance marked successfully for the course ${courseId}`
    );
    return res.redirect("/dashboard/student/" + studentId);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error marking attendance");
  }
  res.redirect(`/dashboard/student/${studentId}`);
};
