//Pages.js - Render hbs pages

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/register_profile', (req, res) => {
    res.render('register_profile');
});

router.get('/joinCreate_room', (req, res) =>{
    res.render('joinCreate_room')
});

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/video_room', (req, res) => {
    res.render('video_room')
})

router.get('/contact_admin', (req, res) => {
    res.render('contact_admin')
})

module.exports = router; //export the routes