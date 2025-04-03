const Attendance = require("../models/attendance");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Course = require("../models/course");
const AttendanceSession = require("../models/attendanceSession");
require("dotenv").config();

module.exports.generateAttendanceCode = async (req, res) => {
  try {
    const { teacherId, courseId } = req.query;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const attendanceCode = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit code between 100000 and 999999 using Math.random()
    console.log("Your attendance code : " + attendanceCode);
    const teacher = await User.findById(teacherId);
    // Check if a non-expired attendance code already exists for the course
    const existingSession = await AttendanceSession.findOne({
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
    const newAttendanceSession = new AttendanceSession({
      teacherId: teacher._id,
      courseId: course._id,
      code: attendanceCode,
      date: Date.now(),
      expiresAt: new Date(Date.now() + process.env.EXPIRY_TIME * 60 * 1000), // Expires EXPIARY_TIME minutes from the current time
    });

    const savedAttendanceSession = await newAttendanceSession.save();
    // Initialize attendance status for each enrolled student in the course
    const enrolledStudents = course.enrolledStudents; // Get the list of enrolled students from the course
    console.log("Enrolled students: ", enrolledStudents); // Log the enrolled students for debugging
    for (const student of enrolledStudents) {
      let studAttRecord = await Attendance.findOne({ studentId: student._id });
      console.log("Student attendance record: ", studAttRecord); // Log the student attendance record for debugging
      if (!studAttRecord) {
        // If no attendance record exists, create a new one
        studAttRecord = new Attendance({
          studentId: student._id,
          courses: [
            {
              courseId: course._id,
              attendance: [],
            },
          ],
        });
      }

      // Find the course in the student's attendance record
      const courseAttendance = studAttRecord.courses.find(
        (crse) => crse.courseId.toString() === course._id.toString()
      );

      if (courseAttendance) {
        console.log("Course attendance found: ", courseAttendance); // Log the found course attendance for debugging
        // Add the attendance session to the existing course's attendance array
        courseAttendance.attendance.push({
          sessionId: savedAttendanceSession._id,
          date: new Date(),
          present: false, // Mark the student as absent initially
        });
        const savedRecord = await studAttRecord.save();
        console.log("saved record in attendance : \n" + savedRecord); // Save the updated attendance record
      } else {
        console.log("Course attendance not found");
      }

      // Save the updated attendance record
      // await studAttRecord.save();
    }
    console.log("saved attendance session : \n" + savedAttendanceSession);
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
    const session = await AttendanceSession.findOne({
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
      const attendanceRecord = courseAttendance.attendance.find(
        (att) => att.sessionId.toString() === session._id.toString()
      );

      if (attendanceRecord) {
        // If the attendance record exists, mark the student as present
        attendanceRecord.present = true;
        attendanceRecord.date = new Date(); // Optionally update the date
      } else {
        req.flash("error", "Attendance marking not allowed for this session");
      }
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

module.exports.getAttendance = async (req, res) => {
  console.log("getAttendance called"); // Log the function call for debugging
  try {
    const { studentId, courseId } = req.params; // Extract studentId and courseId from the request parameters

    // Find the attendance record for the student
    const attendanceRecord = await Attendance.findOne({
      studentId,
    });

    if (!attendanceRecord) {
      console.log("Attendance record not found"); // Log if attendance record is not found
      return res.status(404).json({ message: "Attendance record not found" });
    }

    // Find the specific course attendance details
    const courseAttendance = attendanceRecord.courses.find(
      (course) => course.courseId.toString() === courseId
    );

    if (!courseAttendance) {
      console.log("Course attendance not found"); // Log if course attendance is not found
      return res.status(404).json({ message: "Course attendance not found" });
    }
    console.log(courseAttendance.attendance); // Log the attendance details for debugging

    res.json(courseAttendance.attendance);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching attendance");
  }
};
