const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id => {
    return jwt.sign({ id: id}, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createAndSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      // The cookie can't be accessed or modified by the browser
      //httpOnly: true
    };

    //if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // Remove the password from the response.
    user.password = undefined;

    console.log('token to send', token, res)
    res.status(statusCode).json({
        status: 'success',
        token,
        user
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });
    
    createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    
    const { email, password } = req.body;
  
    // 1) check if email and password are provided in request
    if(!email || !password){
      return next(new AppError('Please provide email and password', 400));
    }
    
    // 2) check if user exists
    const user = await User.findOne({email}).select('+password');
    
    // 3) check if password is correct
    if(!user || !(await user.correctPassword(password, user.password))){
      return next(new AppError('incorrect email or password', 401));
    }
  
    // 4) If everything ok, send token to client
    createAndSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      // httpOnly: true
    });
  
    return res.status(200).json({
      status: 'success',
    });
};

exports.protect = catchAsync(async (req, res, next) => {
  // Getting token and check if it there 
  let token;
  console.log('request', req.headers)
  // 'Bearer ' For testing with postman
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers.cookie){
    token = req.headers.cookie.split('=')[1];
  }

  console.log('token', token);

  if(!token){
    return next(new AppError('You are not login, please log to get access', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if the user still exist
  const currentUser = await User.findById(decoded.id);
  if(!currentUser){
    return next(new AppError('The user belongs to this token no longer exist', 401));
  }

  // Store currentUser
  req.user = currentUser;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) =>{
  // Get current user from the request.
  const user = await User.findById(req.user.id).select('+password');

  // Check if POSTed current password is correct
  if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
    return next(new AppError('Your current password is wrong', 401));
  }

  // Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in and send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});