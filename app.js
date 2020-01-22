const express = require('express');
const cors = require('cors');

const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();
var corsOptions = {
    origin: 'http://localhost:4200',
    credentials: true 
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/users', userRouter);

app.all('*', (req, res, next) => {
    return next(new AppError(`${req.originalUrl} not found in the server`, 404));
});


app.use(globalErrorHandler);

module.exports = app;