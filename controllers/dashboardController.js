const Attendance = require("../models/attendance");
const AttendanceSessions = require("../models/attendanceSession");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Course = require("../models/course");

module.exports.getStudentDashboard = async (req, res) => {
  const id = req.params.id;
  console.log("Student ID:", id);

  // Fetch student details and populate courses
  const student = await User.findById(id).populate({
    path: "courses",
    populate: {
      path: "teacher",
      select: "name",
    },
  });

  // Fetch attendance data and populate course details
  let attendanceData = await Attendance.findOne({ studentId: id }).populate({
    path: "courses.courseId",
    select: "name _id description", // Ensure courseId is included
  });

  // Ensure attendanceData is always an object with a courses array
  if (!attendanceData) {
    attendanceData = { studentId: id, courses: [] };
  }

  console.log("Attendance details:\n", attendanceData);

  res.render("student-dashboard", { student, attendanceData });
};

module.exports.getTeacherDashboard = async (req, res) => {
  try {
    // Check if the logged-in user is a teacher

    const teacherId = req.params.id; // Extract teacher ID from the token

    const teacherDetails = await User.findById(teacherId).populate({
      path: "courses",
      populate: {
        path: "enrolledStudents",
        select: "name email",
      },
    });
    console.log("Teacher details : \n", teacherDetails);
    const attendanceSessions = await AttendanceSessions.find({ teacherId })
      .populate("courseId", "name _id code")
      .populate("teacherId", "name _id email");

    res.render("teacher-dashboard", { teacherDetails, attendanceSessions });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading teacher dashboard");
  }
};
module.exports.getAdminDashboard = async (req, res) => {
  try {
    const adminId = req.params.id; // Extract teacher ID from the token

    const adminDetails = await User.findOne({ _id: adminId });
    console.log("Admin details : \n", adminDetails);
    const courses = await Course.find().populate("teacher", "name");
    const teacherDetails = await User.find({ role: "teacher" }).populate(
      "courses"
    );

    res.render("admin-dashboard", { adminDetails, courses, teacherDetails });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading admin dashboard");
  }
};
