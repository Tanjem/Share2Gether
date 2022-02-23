//Auth.js - Connects to "auth.js" & render pages

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth'); //connect to the controller folder and auth file

router.post('/register', authController.register); 
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router; //export the routes