import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/jwt.js";
import sendEmail from "../utils/email.js";
import crypto from "crypto";
import { sendResponse } from "../utils/responseHandler.js";

// Register User - /api/v1/register
export const registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password, avatar } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar,
  });

  sendToken(user, 201, res);
});

// Login User - /api/v1/login
export const loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter your email & password", 400));
  }

  // Find the user in the database
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.isValidPassword(password))) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res); // Changed to 200 for successful login
});

// Logout User
export const logOutUser = (req, res, next) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .status(200)
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

// Forgot Password - /api/v1/password/forgot
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const resetToken = user.getResetToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
  const message = `Your password reset URL is as follows: \n\n${resetUrl}\n\nIf you did not request this email, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Ecart Password Recovery",
      message,
    });

    sendResponse(res, 200, true, `Email sent to ${user.email}`);

  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Failed to send email", 500));
  }
});

// Reset Password - /api/v1/password/reset/:token
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Password reset token is invalid or expired", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpire = undefined;
  await user.save({ validateBeforeSave: false });

  sendToken(user, 200, res); // Changed to 200 for successful reset
});

// Get User Profile - /api/v1/profile
export const getUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  sendResponse(res, 200, true, "User profile retrieved successfully", user);

});

// Change Password - /api/v1/password/change
export const changePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check old password
  if (!(await user.isValidPassword(req.body.oldPassword))) {
    return next(new ErrorHandler("Old password is incorrect", 401));
  }

  // Assign new password
  user.password = req.body.password;
  await user.save();

  sendResponse(res, 200, true, "Password changed successfully");
});

// Update Profile - /api/v1/profile/update
export const updateProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
  });

  sendResponse(res, 200, true, "Profile updated successfully", user);

});

// Admin: Get All Users - /api/v1/admin/users
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  sendResponse(res, 200, true, "Users retrieved successfully", users);

});

// Admin: Get Specific User - /api/v1/admin/user/:id
export const getUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User not found with this ID: ${req.params.id}`, 404)
    );
  }

  sendResponse(res, 200, true, "User retrieved successfully", user);
});

// Admin: Update User - /api/v1/admin/user/:id
export const updateUser = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
  });

  sendResponse(res, 200, true, "User updated successfully", user);
});

// Admin: Delete User - /api/v1/admin/user/:id
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User not found with this ID: ${req.params.id}`, 404)
    );
  }

  await user.deleteOne();

  sendResponse(res, 200, true, "User deleted successfully");
});
