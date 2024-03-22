require('dotenv').config();
const express = require('express');
const app = express();
const warner = require("./route/index");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser'); 
const bodyParser = require('body-parser');

app.use(express.json()); // this takes the data and attachs it to the req handler, so we can then access it req.body.something
app.use(cookieParser()); 




mongoose.set(`strictQuery`, false);
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI); 
        console.log(`DataBase Connected: ${conn.connection.host}`); 
    } catch (error) {
        console.log(error);
    }
}

connectDB();



app.use("/",warner);


const PORT =  3000;
app.listen(PORT, () => {
    console.log(`Listning on port ${PORT}`);
})