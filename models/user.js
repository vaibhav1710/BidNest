const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Invalid email address']
    },
    contact: {
        type: Number,
        required: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v.toString());
            },
            message: props => `${props.value} is not a valid phone number! Must be 10 digits.`
        }
    },
    ads: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
});

//Before saving
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(); 
    this.password = await bcrypt.hash(this.password, salt); 
    next(); 
});


// After Saving that data
userSchema.post('save', function (document, next) {
    console.log('A new user was created and saved', document); 
    next(); 
}); 


userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email }); 
    if (user) {
        const auth = await bcrypt.compare(password, user.password); 
        if (auth) {
            return user; 
        } else {
            throw Error('Incorrect Password'); 
        }
    } else {
        throw Error('Incorrect Email'); 
    }
}

const User = mongoose.model('User', userSchema);

module.exports = User;
