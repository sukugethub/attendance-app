const AttendanceSession = require('../models/AttendanceSession');
const crypto = require('crypto');

exports.getTeacherDashboard = async (req, res) => {
    const teacherId = req.user.id;
    const sessions = await AttendanceSession.find({ teacherId });

    res.render('teacherDashboard', { user: req.user, sessions });
};

exports.startAttendance = async (req, res) => {
    const { className } = req.body;
    const teacherId = req.user.id;
    
    // Generate a unique 6-character code
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 min

    const session = new AttendanceSession({ teacherId, className, code, expiresAt });
    await session.save();

    res.json({ message: 'Attendance started', code, expiresAt });
};

exports.checkProxies = async (req, res) => {
    const teacherId = req.user.id;
    const sessions = await AttendanceSession.find({ teacherId });

    let proxyList = [];

    for (const session of sessions) {
        let ipCounts = {};
        session.studentsMarked.forEach((entry) => {
            ipCounts[entry.ip] = (ipCounts[entry.ip] || 0) + 1;
        });

        Object.entries(ipCounts).forEach(([ip, count]) => {
            if (count > 1) {
                proxyList.push({ className: session.className, ip, count });
            }
        });
    }

    res.render('proxyList', { proxyList });
};
