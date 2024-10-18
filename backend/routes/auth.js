const express = require('express');
const {
  registerUser,
  loginUser,
  logOutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  changePassword,
  updateProfile,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/authController");
const router = express.Router();
const {isAuthendicatedUser, authorizeRoles} = require('../midddlewares/authenticate')

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logOutUser);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);
router.route('/getprofile').get(isAuthendicatedUser,getUserProfile);
router.route('/password/change').put(isAuthendicatedUser,changePassword);
router.route('/update').put(isAuthendicatedUser,updateProfile);

//Admin routes
router.route('/admin/users').get(isAuthendicatedUser,authorizeRoles('admin'),getAllUsers);
router.route('/admin/user/:id').get(isAuthendicatedUser,authorizeRoles('admin'),getUser);
router.route('/admin/user/:id').put(isAuthendicatedUser,authorizeRoles('admin'),updateUser);
router.route('/admin/user/:id').delete(isAuthendicatedUser,authorizeRoles('admin'),deleteUser);


module.exports = router;