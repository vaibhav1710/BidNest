require("dotenv").config();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const client = require("../redisClient");
const {Queue} = require('bullmq');
const {Worker} = require('bullmq');

const emailQueue = new Queue('welcomeq', 
{connection: {
    host: 'localhost', // Docker container hostname
    port: 6379,    // Default Redis port
}
});
  
 

const worker = new Worker("welcomeq" , async(job) => {
   await welComeEmail(job.data.email);
},{connection: {
    host: 'localhost', // Docker container hostname
    port: 6379,    // Default Redis port
    // Add other connection options if needed
}});



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
const cacheage = 60*60*1000;
const maxAge = 30 * 24 * 60 * 60; // 30 days
const createToken = (email, password) => {
    return jwt.sign({ email, password}, process.env.SECRET, {
        expiresIn: maxAge
    }); 
}

const createTokenid = (id) => {
    return jwt.sign({id}, process.env.SECRET, {
        expiresIn: maxAge
    }); 
}

module.exports.getLogin = async(req,res) => {
    res.render("login");
}

module.exports.getRegister = async(req,res) => {
    res.render("index");
}


module.exports.register = async (req, res) =>{
    const { email, password } = req.body; 
    console.log(email,password);
    try {

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // Email is already registered, return an error response
            return res.status(400).json({ error: 'Email is already registered' });
        }

      //  const user = await User.create({ email, password , name , contact }); 
        const token = createToken(email, password); 
        await sendVerificationEmail(email,token);
        // res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000}); 
         res.send("Email Sent"); //.json({ user: user._id});
    } catch (error) {
        const errors = errorHandler(error); 
        res.status(400).json({ errors }); 
    }
}


module.exports.verify = async (req,res) => {
    const { token } = req.params; 

    try{
     
        const decodedToken = jwt.verify(token, process.env.SECRET);
        const {email, password} = decodedToken;  
        const user = await User.create({ email, password });
       
        await client.set(email, user._id, 'EX', cacheage);
        await emailQueue.add('welcome' , {email:email});
        const idtoken = createTokenid(user._id);
        res.cookie('jwt', idtoken , { httpOnly: true, maxAge: maxAge * 1000 });
        res.redirect("/api/feed");

    }catch(err){

    }
}


async function welComeEmail(email) {
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
            subject: "Welcome Email",
            html: `
                       <p>Hello,</p>
                       <p>Welcome to fBay, hope u enjoy selling</p>
                       
                   ` 
          });
        
          console.log('Welcome email sent:', info.messageId);
           }catch (err) {
               const errors = errorHandler(err); 
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
    try {
        // Check if the token is present in the Redis cache
       const id = await client.get(email); 
      // console.log(id);
       
          if(id!=null){
             const token = createTokenid(id);
            
             console.log(req.session.userId);
             res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
             res.redirect("/api/feed");
          }else{
            const user = await User.login(email, password);
        
            if (!user) {
                throw new Error('Invalid credentials');
            }
            
            const newToken = createToken(id);
            console.log("Yahan aaya tha");
            await client.set(email, user._id, 'EX', cacheage);; // Cache the new token in Redis

            res.cookie('jwt', newToken, { httpOnly: true, maxAge: maxAge * 1000 });
            res.redirect("/api/feed");
          }
          console.log(req.session.userId);
    } catch (err) {
        console.error('Error during login:', err);
        res.status(400).json({ error: 'Invalid credentials' });
    }

}

async function cacheToken(email, token) {
    return new Promise((resolve, reject) => {
        client.setex(email, 3600, token, (err, result) => { // Cache token for 1 hour (3600 seconds)
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}


module.exports.logout = async (req, res) => {
    res.clearCookie("jwt");
    res.redirect('/'); 
}