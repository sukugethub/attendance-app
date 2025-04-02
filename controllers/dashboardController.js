const Attendance = require('../models/attendance');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Course = require('../models/course');

module.exports.getStudentDashboard = async (req, res) => {
    const id = req.params.id; // Passed from middleware
        const student = await User.findById(id).populate('courses');
        console.log("Student details : \n",student);
        res.render('student-dashboard', { student });
};


module.exports.getTeacherDashboard = async (req, res) => {
    try {
        // Check if the logged-in user is a teacher
        
        const teacherId = req.params.id; // Extract teacher ID from the token

        
        const teacherDetails = await User.findById(teacherId)
        .populate({
            path: 'courses',
            populate: {
                path: 'enrolledStudents',
                select: 'name email',
            },
        });
console.log("Teacher details : \n",teacherDetails);
       
        
        res.render('teacher-dashboard', { teacherDetails });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading teacher dashboard');
    }
};
module.exports.getAdminDashboard = async (req, res) => {
    try {
        

        const adminId = req.params.id; // Extract teacher ID from the token
      
        const adminDetails = await User.find({ _id: adminId });
console.log("Admin details : \n",adminDetails);
       const courses = await Course.find().populate('teacher', 'name');
    const teacherDetails = await User.find({ role: 'teacher' }).populate('courses');
        
        res.render('admin-dashboard', { adminDetails, courses, teacherDetails });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading admin dashboard');
    }
};

