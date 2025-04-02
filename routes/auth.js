const express = require('express');
const { register, login, logout, getRegisterForm } = require('../controllers/authController.js');
console.log(register);

const router = express.Router();

router.get('/register', getRegisterForm);
router.post('/register', register);
router.get('/login', (req, res) => res.render('student-login'));
router.post('/login', login);

router.get('/logout', logout);

module.exports = router;
