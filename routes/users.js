//Users.js - Connects to "userController.js" & render pages

const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');


router.get('/user-profile', userController.profile);
router.post('/user-profile', userController.uploadpic);
router.get('/admin_page', userController.view);
router.post('/admin_page', userController.find);
router.get('/adduser', userController.form);
router.post('/adduser', userController.create);
router.get('/edituser/:Id', userController.edit);
router.post('/edituser/:Id', userController.update);
router.get('/viewuser/:Id', userController.viewall);
router.get('/:Id', userController.delete);



module.exports = router; //export the routes