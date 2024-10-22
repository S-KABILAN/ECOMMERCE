import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/jwt.js";
import sendEmail from "../utils/email.js";
import crypto from "crypto";
import { sendResponse } from "../utils/responseHandler.js";
import { factoryService } from "../services/factoryService.js";
import { StatusCodes } from "http-status-codes";


// Register User - /api/v1/register
export const registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password, avatar } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar,
  });

  sendToken(user, StatusCodes.CREATED, res);
});


// Login User - /api/v1/login
export const loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ErrorHandler("Please enter your email & password", StatusCodes.BAD_REQUEST)
    );
  }

  // Find the user in the database
  const user = await factoryService.find(User,{ email }).select("+password");

  if (!user || !(await user.isValidPassword(password))) {
    return next(new ErrorHandler("Invalid email or password", StatusCodes.UNAUTHORIZED));
  }

  sendToken(user, StatusCodes.OK, res); // Changed to 200 for successful login
});


// Logout User
export const logOutUser = (req, res, next) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .status(StatusCodes.OK)
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

// Forgot Password - /api/v1/password/forgot
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", StatusCodes.NOT_FOUND));
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

    sendResponse(res, StatusCodes.OK, true, `Email sent to ${user.email}`);

  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Failed to send email", StatusCodes.INTERNAL_SERVER_ERROR));
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
      new ErrorHandler("Password reset token is invalid or expired", StatusCodes.BAD_REQUEST)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", StatusCodes.BAD_REQUEST));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpire = undefined;
  await user.save({ validateBeforeSave: false });

  sendToken(user, StatusCodes.OK, res); // Changed to 200 for successful reset
});

// Get User Profile - /api/v1/profile
export const getUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await factoryService.findById(User, req.user.id);

  sendResponse(res, StatusCodes.OK, true, "User profile retrieved successfully", user);

});

// Change Password - /api/v1/password/change
export const changePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check old password
  if (!(await user.isValidPassword(req.body.oldPassword))) {
    return next(new ErrorHandler("Old password is incorrect", StatusCodes.NOT_FOUND));
  }

  // Assign new password
  user.password = req.body.password;
  await user.save();

  sendResponse(res, StatusCodes.OK, true, "Password changed successfully");
});

// Update Profile - /api/v1/profile/update
export const updateProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await factoryService.updateById(User, req.user.id, newUserData);

  sendResponse(res, StatusCodes.OK, true, "Profile updated successfully", user);

});

// Admin: Get All Users - /api/v1/admin/users
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await factoryService.find(User, {});

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    "Users retrieved successfully",
    users
  );

});

// Admin: Get Specific User - /api/v1/admin/user/:id
export const getUser = catchAsyncError(async (req, res, next) => {
  const user = await factoryService.findById(User, req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(
        `User not found with this ID: ${req.params.id}`,
        StatusCodes.NOT_FOUND
      )
    );
  }

  sendResponse(res, StatusCodes.OK, true, "User retrieved successfully", user);
});

// Admin: Update User - /api/v1/admin/user/:id
export const updateUser = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await factoryService.updateById(
    User,
    req.params.id,
    newUserData
  );

  sendResponse(res, StatusCodes.OK, true, "User updated successfully", user);
});

// Admin: Delete User - /api/v1/admin/user/:id
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await factoryService.findById(User, req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(
        `User not found with this ID: ${req.params.id}`,
        StatusCodes.NOT_FOUND
      )
    );
  }

  await factoryService.deleteById(User, req.params.id);

  sendResponse(res, StatusCodes.OK, true, "User deleted successfully");
});
