const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController')
//for uploading user image
const {UserUpload} = require('../config/storage');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.put('/addProfile', UserUpload.single('image'), AuthController.addProfileImage);
router.put('/update', AuthController.update);
router.put('/changePassword', AuthController.changePassword);
router.get('/verify', AuthController.verify);

module.exports = router