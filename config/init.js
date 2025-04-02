const { connectDB } = require('./db');
const mongoose = require('mongoose'); // Import mongoose for ObjectId
const Course = require('../models/course');
const User = require('../models/user');

connectDB();

const insertCourses = async () => {
    try {
        await Course.deleteMany({}); // Clear existing courses

        // Example teacher ID (replace with an actual teacher ID from your database)
        const teacherId = new mongoose.Types.ObjectId('67eb0a11ce7b5cdba33d6637');

        // Example student IDs (replace with actual student IDs from your database)
        const student1 = new mongoose.Types.ObjectId('67eaf60a549254f97f1e8330');
        const student2 = new mongoose.Types.ObjectId('67eaf8252a8cd614822784f7');
        const student3 = new mongoose.Types.ObjectId('67eafa46168347743c35d791'); // Student for whom attendance will be added

        // Sample courses with enrolled students
        const courses = [
            {
                name: 'Mathematics 101',
                code: 'MATH101',
                teacher: teacherId,
                enrolledStudents: [student1, student2],
                attendance: [
                    {
                        date: new Date('2025-04-01'), // Example attendance date
                        studentsPresent: [student1, student2],
                    },
                ],
            },
            {
                name: 'Physics 201',
                code: 'PHYS201',
                teacher: teacherId,
                enrolledStudents: [student2, student3],
                attendance: [
                    {
                        date: new Date('2025-04-01'), // Example attendance date
                        studentsPresent: [student2, student3], // Includes student3
                    },
                ],
            },
            {
                name: 'Chemistry 301',
                code: 'CHEM301',
                teacher: teacherId,
                enrolledStudents: [student1, student3],
                attendance: [
                    {
                        date: new Date('2025-04-01'), // Example attendance date
                        studentsPresent: [student1, student3], // Includes student3
                    },
                ],
            },
        ];

        // Insert courses into the database
        await Course.insertMany(courses);
        console.log('Sample courses with enrolled students and attendance inserted successfully!');
    } catch (error) {
        console.error('Error inserting courses:', error.message);
    } finally {
        process.exit(); // Exit the script after execution
    }
};

// insertCourses();
const insertCoursesForStudent = async () => {
    try {
        // Example student ID (replace with an actual student ID from your database)
        const studentId = new mongoose.Types.ObjectId('67eafa46168347743c35d791');

        // Example courses (replace with actual course IDs from your database)
        const course1 = new mongoose.Types.ObjectId('67eb0d0349c5f87dc8540d2d'); // Replace with actual course ID
        const course2 = new mongoose.Types.ObjectId('67eb0d0349c5f87dc8540d2f'); // Replace with actual course ID
        const course3 = new mongoose.Types.ObjectId('67eb0d0349c5f87dc8540d31'); // Replace with actual course ID

        // Update the student's courses field
        await User.findByIdAndUpdate(
            studentId,
            { $addToSet: { courses: { $each: [course1, course2, course3] } } }, // Add courses without duplicates
            { new: true }
        );

        console.log('Courses added to the student successfully!');
    } catch (error) {
        console.error('Error adding courses to the student:', error.message);
    } finally {
        process.exit(); // Exit the script after execution
    }
};

insertCoursesForStudent();