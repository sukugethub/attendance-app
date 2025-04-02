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
        res.render('admin-dashboard', { teachers, courses });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading dashboard');
    }
});


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

        res.redirect('/admin/dashboard?success=Course assigned to teacher successfully');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/dashboard?error=Error assigning course to teacher');
    }
});

// Handle course deletion
router.post('/delete-course/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        await Course.findByIdAndDelete(courseId); // Delete the course by ID
        // res.redirect('/admin/dashboard'); 
        
        res.redirect('/admin/dashboard?success=Course deleted successfully');// Redirect back to the admin dashboard
    } catch (error) {
        console.error(error);
        // res.status(500).send('Error deleting course');
        res.redirect('/admin/dashboard?error=Error deleting course');
    }
});

module.exports = router;






