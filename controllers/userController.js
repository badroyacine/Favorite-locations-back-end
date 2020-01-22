const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.getUser = catchAsync(async (req, res, next) => { 
    const user = await User.findById(req.params.id);

    if(!user){
      return next(new appError('no user found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        user
    });

});

// Update email and name of user
exports.updateMe = catchAsync(async (req, res, next) =>{
    
    if(req.body.password || req.body.passwordConfirm){
      return next(new AppError('This route is not for pasword updates', 400));
    }
  
    const userInfos = {
      name: req.body.name,
      email: req.body.email
    }
    
    // 3) Update user
    const user = await User.findByIdAndUpdate(req.user.id, userInfos, {
      new: true, // Retourner les nouvelles valeurs
      runValidators: true
    });
  
    res.status(200).json({
      status: 'success',
      user
    });
  
});