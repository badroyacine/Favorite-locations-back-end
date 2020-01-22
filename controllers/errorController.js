const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  message = `${err.value} is not a valid value for ${err.path}`;
  return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  message = `${value} already exists. please choose another one.`
  return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid inputs. ${errors.join('. ')}`;
  return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token, please login again.', 401)
const handleJWTExpiredError = () => new AppError('Your token has expired, please login again', 401)

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;

  if(error.name === "CastError") error = handleCastErrorDB(error);
  if(error.code === 11000) error = handleDuplicateFieldsDB(error);
  if(error.name === "ValidationError") error = handleValidationErrorDB(error);
  if(error.name === "JsonWebTokenError") error = handleJWTError();
  if(error.name === "TokenExpiredError") error = handleJWTExpiredError();

  if(error.isOperational){
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    console.log('errorr', error);
    res.status(500).json({
      status: 'error',
      message: 'unexpected error !',
    });
  }
};