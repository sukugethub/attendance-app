const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Course = require("../models/course");
const { getAdminDashboard } = require("../controllers/dashboardController");

// Render the admin dashboard with all courses
router.get("/dashboard", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }); // Fetch all teachers
    const courses = await Course.find().populate("teacher", "name"); // Fetch all courses with teacher details
    res.render("admin-dashboard", { teachers, courses });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading dashboard");
  }
});

// Handle course creation and assign it to an existing teacher
router.post("/add-course/:adminId", async (req, res) => {
  console.log("add-course route hit");
  const { name, code, teacherName } = req.body;
  const { adminId } = req.params;

  try {
    // Find the teacher by name
    const teacher = await User.findOne({ name: teacherName, role: "teacher" });
    if (!teacher) {
      return res.redirect(`/dashboard/admin/${adminId}`);
    }

    // Fetch all students
    const students = await User.find({ role: "student" });

    // Create a new course and assign it to the teacher
    const newCourse = new Course({
      name,
      code,
      teacher: teacher._id,
      enrolledStudents: students.map((student) => student._id), // Automatically enroll all students
    });

    const newCourseAdded = await newCourse.save();

    // Add the course to the teacher's `courses` field
    teacher.courses.push(newCourseAdded._id);
    await User.updateMany(
      { role: "student" },
      { $push: { courses: newCourseAdded._id } }
    );
    await teacher.save();
    req.flash("success", "Course added successfully!");
    res.redirect(`/dashboard/admin/${adminId}`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Error adding course");
    res.redirect(`/admin/dashboard/${adminId}`);
  }
});

// Handle course deletion
router.post("/delete-course/:courseId/:adminId", async (req, res) => {
  try {
    const { courseId, adminId } = req.params;
    const course = await Course.findById(courseId).populate("teacher", "name");

    await Course.findByIdAndDelete(courseId); // Delete the course by ID
    // Remove the course from the teacher's `courses` field
    if (course.teacher) {
      await User.findByIdAndUpdate(course.teacher._id, {
        $pull: { courses: courseId },
      });
    }

    // Remove the course from all students' `enrolledCourses` field
    await User.updateMany(
      { role: "student" },
      { $pull: { enrolledCourses: courseId } }
    );
    req.flash("success", "Course deleted successfully!");
    res.redirect(`/dashboard/admin/${adminId}`); // Redirect back to the admin dashboard
  } catch (error) {
    console.error(error);
    // res.status(500).send('Error deleting course');
    req.flash("error", "Error deleting course");
    res.redirect(`/dashboard/admin/${adminId}`);
  }
});

module.exports = router;
