const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/role/:role', userController.getUsersByRole);
router.put('/:id', userController.updateUser);

module.exports = router;
