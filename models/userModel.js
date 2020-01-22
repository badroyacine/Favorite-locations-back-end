const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'The name is required']
    },
    email: {
        type: String,
        trim: true,
        required: [true, 'The email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: { 
            validator: function(el) {
                return el === this.password;
            },
            message: 'Password and confirm password do not match'
        },

    }
});

// Hash password when created or updated, and delete passwordConfirm to not save it in DB
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

// Check if the condidate password is correct
userSchema.methods.correctPassword = async function(condidatePassword, userPassword){
    return await bcrypt.compare(condidatePassword, userPassword);
}

const User = mongoose.model('User', userSchema);

module.exports = User;