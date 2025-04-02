const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

module.exports.getRegisterForm = (req, res) => {
    console.log("getRegisterForm invoked");
    res.render('student-register');
}
module.exports.register = async (req, res) => {
    console.log("register invoked");
    const { name, email, password, role } = req.body;
    console.log(name, email, password, role);
    // const role = "student";
    // console.log(role);
    try {
        const newUser = new User({ name, email, password, role });
        const savedUser = await newUser.save();
        console.log(savedUser);
         // Generate JWT token
         const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

         // Save token in a cookie
         res.cookie('token', token, { httpOnly: true, secure: true });
        // res.redirect(`/dashboard?id=${savedUser._id}`);
        res.redirect(`/dashboard/${savedUser.role}/${savedUser._id}`);

    } catch (error) {
        console.log(error);
        res.status(400).send('Error: ' + error.message);
    }
};

module.exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        const role = user.role;
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Invalid credentials');
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.cookie('token', token).redirect(`/dashboard/${role}/${user._id}`);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

module.exports.logout = (req, res) => {
    res.clearCookie('token').redirect('/auth/login');
};
