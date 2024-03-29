const nodemailer = require("nodemailer");
const itemModel = require("./models/product");
const userModel = require( "./models/user" );
const bidModel = require("./models/bids")
const {Queue} = require('bullmq');
const {Worker} = require('bullmq');
require("dotenv").config();

const expireQueue = new Queue('ad-expiration' , {connection: {
  host: 'localhost', // Docker container hostname
  port: 6379,    // Default Redis port
}});



module.exports.getExpireditems =  async function getExpireditems(){
      const currentTime = new Date();

    // Add 4 hours to the current time
       
        const expireditems = await itemModel.find({ auctionEnd: { $lte: currentTime } });
        
        console.log("All items =>",expireditems);

        expireditems.forEach(async (item) => {
            try {
                // Your logic to update the status of items (e.g., mark them as expired)
                // Example: item.status = 'expired'
                 console.log("1by1 => ", item);
                // Enqueue email tasks for seller and bidders
                if(item.seller._id !== item.latestbidder._id){
                  await expireQueue.add('sendSellerEmail', { id: item._id });
                  await expireQueue.add('sendBidderEmails', { id: item._id });
                }
                // Remove the item from the database
                await itemModel.findByIdAndDelete(item._id);
            } catch (error) {
                console.error('Error processing item:', error);
            }
        })
}

new Worker('ad-expiration', async (job) => {
    const { id } = job.data;
        
        if(job.name === 'sendSellerEmail'){
        const item = await itemModel.findById(id).populate('seller');
        console.log("Seller =>", item.seller.email, item);
        await sellerMail(item.seller.email, item);
        
      }else if(job.name === "sendBidderEmails"){
             
        const item = await itemModel.findById(id).populate('latestbidder');
        console.log("Bidder =>", item.latestbidder.email, item);
        await sellerMail(item.latestbidder.email, item);
      }

},{connection: {
    host: 'localhost', // Docker container hostname
    port: 6379,    // Default Redis port
    // Add other connection options if needed
}});


async function bidderMail(email,item) {
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
        subject: "Auction Ended: You have Won !!",
        text: `Dear User,\n\nYour bid of ${item.currentBid} on "${item.title}" is highest and you have won!! Thank you for using our platform.\n\nRegards,\nThe Auction Team`
      });
    
      console.log('Bidder email sent:', info.messageId);
       }catch (err) {
           const errors = errorHandler(err); 
           res.status(400).json({ errors });
      }
   }

   async function sellerMail(email,item) {
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
        subject: `Auction Ended: Your ${item.title} has been sold!!`,
        text: `Dear User,\n\nYour item "${item.title}" auction period has expired. It has been sold for ${item.currentBid}. Thank you for using our platform.\n\nRegards,\nThe Auction Team`
      });
    
      console.log('Bidder email sent:', info.messageId);
       }catch (err) {
           const errors = errorHandler(err); 
           res.status(400).json({ errors });
      }
   }




