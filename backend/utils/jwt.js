
const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  //creating cookies
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000,
    ),
    httpOnly: "true",
  };

  //creating jwt token

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};

module.exports = sendToken;
