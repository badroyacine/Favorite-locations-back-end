const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Uncaught Exception (that accur in synchronous code)
process.on('uncaughtException', err =>{
    console.log(err.name, err.message);
    process.exit(1);
});

const app = require('./app');

dotenv.config({path: './config.env'});

const port = process.env.PORT || 3000;

// When using remote mongodb database
// const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => console.log('Connexion success to database!'));

const server = app.listen(port, () => {
    console.log('The server is listening...');
});

// unhandled Rejected Promises (that accur in asynchronous code witch were not previosly handled)
process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
  
    server.close(() => {
      process.exit(1);
    })
})