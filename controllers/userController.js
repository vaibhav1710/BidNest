require("dotenv").config();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");



const errorHandler = (error) => {
    console.log(error.message, error.code); 
    let errors = {email: '', password: ''}; 

    // Incorrect Email
    if (error.message === 'Incorrect Email'){
        errors.email = 'This email is not registered'; 
    }

    // Incorrect Passwords
    if (error.message === 'Incorrect Password'){
        errors.password = 'The password is Incorrect'; 
    }

    // Duplicate Email Error
    if (error.code === 11000) {
        errors.email = 'This Email is already registered'; 
        return errors;
    }

    // Custom Validation Error
    if (error.message.includes('user validation failed')) {
        (Object.values(error.errors)).forEach (({properties}) => {
            errors[properties.path] = properties.message; 
            // properties.path can either be email or password
            // they shall store the error they are giving
        }); 
    } 
    return errors; 
}

const maxAge = 30 * 24 * 60 * 60; // 30 days
const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET, {
        expiresIn: maxAge
    }); 
}


module.exports.register = async (req, res) =>{
    const { email, password , name, contact } = req.body; 
    console.log(email,password,name, contact);
    try {
        const user = await User.create({ email, password , name , contact }); 
        const token = createToken(user._id); 
        await sendVerificationEmail(email,token);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000}); 
        res.status(201).json({ user: user._id});
    } catch (error) {
        const errors = errorHandler(error); 
        res.status(400).json({ errors }); 
    }
}

async function sendVerificationEmail(email, token) {
 try{   
const transporter = await nodemailer.createTransport({
    service:"gmail",
     auth: {
       user: process.env.EMAIL,
       pass: process.env.PASSWORD,
     },
   });
   
 const info =  await transporter.sendMail({
     from: "testnodejs1710@gmail.com",
     to: `<${email}>`,
     subject: "Verification Email",
     html: `
                <p>Hello,</p>
                <p>Please click the following link to verify your email address:</p>
                <p><a href="http://localhost:3000/verify/${token}">http://localhost:3000/verify/${token}</a></p>
                <p>If you didn't sign up for our service, you can safely ignore this email.</p>
            ` 
   });
 
   console.log('Verification email sent:', info.messageId);
    }catch (err) {
        const errors = errorHandler(err); 
        res.status(400).json({ errors });
   }
}

module.exports.login = async (req, res) =>{
    const { email, password } = req.body; 
    //console.log(email,password);

    try {
         const user = await User.login(email,password); 
         //console.log(user);
         const token = createToken(user._id); 
         res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000}); 
         res.status(200).json({ user: user._id});
        
    } catch (err) {
        const errors = errorHandler(err); 
        res.status(400).json({ errors });
    }
    
}


module.exports.logout = async (req, res) => {
    res.clearCookie("jwt");
    res.redirect('/'); 
}