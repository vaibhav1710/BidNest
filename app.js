require('dotenv').config();
const express = require('express');
const app = express();
var path = require('path');
const warner = require("./route/index");
const ads = require("./route/ads");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser'); 
const bodyParser = require('body-parser');
const session = require('express-session');
const cron = require('node-cron');
const {getExpireditems} = require("./checkExpired");
const Product = require("./models/product");

const { createServer } = require('node:http');
const { Server } = require('socket.io');

const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    socket.on('priceUpdate', (msg) => {
        io.emit('priceUpdate', msg);
    });
    console.log("Connection on ke andar");
});





cron.schedule('0 * * * *', async () => {
    try {
        console.log("Running Script");     // Your logic to update the status of items here
        await getExpireditems();
    } catch (error) {
        console.error('Error running CRON job:', error);
    }
});


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Use express-session middleware
app.use(session({
  secret: 'hellobhailog',
  resave: true,
  saveUninitialized: true
}));


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
app.use("/api" ,ads);


const PORT =  3000;
app.listen(PORT, () => {
    console.log(`Listning on port ${PORT}`);
})


