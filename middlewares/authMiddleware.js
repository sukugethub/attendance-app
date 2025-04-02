const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports.verifyToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/auth/login');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        res.clearCookie('token').redirect('/auth/login');
    }
};
