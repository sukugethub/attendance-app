const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const teacherRoutes = require('./routes/teacher');
const attendanceRoutes = require('./routes/attendance');
const { getRegisterForm } = require('./controllers/authController');
const adminRoutes = require('./routes/admin');

// console.log("authRoutes", authRoutes);

dotenv.config();
connectDB();
const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/admin', adminRoutes);
const session = require('express-session');
const flash = require('connect-flash');



// Set up session middleware
app.use(session({
    secret: "jakhfafbdbfakebie", // Replace with a secure secret key
    resave: false,
    saveUninitialized: true,
}));

// Set up flash middleware
app.use(flash());

// Make flash messages available in all views
app.use((req, res, next) => {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
});

// Routes
app.use('/auth', authRoutes);

app.use('/dashboard', dashboardRoutes);
app.use("/teacher", teacherRoutes);
app.use('/attendance', attendanceRoutes);

app.get('/', (req, res) => res.render('student-login'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
