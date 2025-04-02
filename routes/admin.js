const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Course = require('../models/course');
const { getAdminDashboard } = require('../controllers/dashboardController');




// Render the admin dashboard with all courses
router.get('/dashboard', async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' }); // Fetch all teachers
        const courses = await Course.find().populate('teacher', 'name'); // Fetch all courses with teacher details
        res.render('admin-dashboard', { teacherDetails: teachers, courses }); // Pass teachers as teacherDetails
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading dashboard');
    }
});


// Handle course creation and assign it to an existing teacher
// Handle course creation and assign it to an existing teacher
router.post('/add-course', async (req, res) => {
    const { name, code, teacherName } = req.body;

    try {
        // Find the teacher by name
        const teacher = await User.findOne({ name: teacherName, role: 'teacher' });
        if (!teacher) {
            return res.redirect('/admin/dashboard?error=Teacher not found');
        }

        // Fetch all students
        const students = await User.find({ role: 'student' });

        // Create a new course and assign it to the teacher
        const newCourse = new Course({
            name,
            code,
            teacher: teacher._id,
            enrolledStudents: students.map(student => student._id), // Automatically enroll all students
        });

        await newCourse.save();

        // Add the course to the teacher's `courses` field
        teacher.courses.push(newCourse._id);
        await teacher.save();

        // Add the course to each student's `courses` field
        for (const student of students) {
            student.courses.push(newCourse._id);
            await student.save();
        }

        res.redirect('/admin/dashboard?success=Course assigned to teacher successfully');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/dashboard?error=Error assigning course to teacher');
    }
});

// Handle course deletion
// Handle course deletion
router.post('/delete-course/:id', async (req, res) => {
    try {
        const courseId = req.params.id;

        // Find the course to be deleted
        const course = await Course.findById(courseId);
        if (!course) {
            return res.redirect('/admin/dashboard?error=Course not found');
        }

        // Remove the course from the teacher's `courses` field
        const teacher = await User.findById(course.teacher);
        if (teacher) {
            teacher.courses = teacher.courses.filter(course => course.toString() !== courseId);
            await teacher.save();
        }

        // Remove the course from each student's `courses` field
        const students = await User.find({ _id: { $in: course.enrolledStudents } });
        for (const student of students) {
            student.courses = student.courses.filter(course => course.toString() !== courseId);
            await student.save();
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId);

        res.redirect('/admin/dashboard?success=Course deleted successfully');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/dashboard?error=Error deleting course');
    }
});


module.exports = router;






