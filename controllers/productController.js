require("dotenv").config();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const itemModel = require("../models/product");
const userModel = require( "../models/user" );
const {cloudinary} = require('../cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const bidModel = require("../models/bids");
const {Queue} = require('bullmq');
const {Worker} = require('bullmq');

const bidqueue = new Queue("bid-queue", 
    {connection: {
    host: 'localhost', // Docker container hostname
    port: 6379,    // Default Redis port
}});

const worker = new Worker("bid-queue", async(job) => {
    const { item_id, id , bidAmount } = job.data;
    console.log(item_id)
    const ad = await itemModel.findById(item_id);
    ad.currentBid = bidAmount;
    ad.latestbidder = id;
    await ad.save();
},
{
    connection:{
        host: 'localhost', // Docker container hostname
        port: 6379,  
    }
}
)

module.exports.newAd = async(req,res) => {
    
    const result = await cloudinary.uploader.upload(req.file.path);
    const { title, description, currentBid } = req.body;
    let auctionEnd = new Date();
    auctionEnd.setHours(auctionEnd.getHours() + 48);
    console.log(auctionEnd);
    console.log(req.session.userId); 
    const token = req.cookies.jwt;
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const {id} = decodedToken;  
    console.log(id);
    const item = await itemModel.create({
        title: title,
        description: description,
        currentBid: currentBid,
        seller: id,
        latestbidder:id,
        photoUrl: result.secure_url, // Save Cloudinary image URL
        auctionEnd: auctionEnd
    });

    const user = await userModel.findById(id);
    user.ads.push(item._id);
    await user.save();
   
    res.redirect("/api/feed");
}


module.exports.updatebid = async(req,res) => {
    const item_id = req.params.id;
    const  bidAmount = req.body.bidAmount;
    const ad = await itemModel.findById(item_id);
    console.log("BidAmount =>",bidAmount);
    console.log("Ad=>",ad);
    const token = req.cookies.jwt;
    const {id} = jwt.verify(token, process.env.SECRET);
    
    console.log(id);
    try{
    console.log("Seller id => ",ad.seller.toString());
    if(id !== ad.seller.toString() && bidAmount > ad.currentBid && ad.latestbidder.toString()!== id){

       

        const currentTime = new Date();
            if (currentTime <= ad.auctionEndTime) {
                const newBid = await bidModel.create({
                    bidder: id,
                    amount: bidAmount,
                    item: item_id,
                    time: currentTime // Use current time for bid
                });
                await newBid.save();

                await bidqueue.add('updateBid', {
                    item_id: item_id,
                    id: id,
                    bidAmount: bidAmount
                });
            } else {
                // Auction has ended, do not allow further bids
                console.log("Auction has ended, cannot place new bid.");
            }

    }else{

    }
    res.redirect(`/api/ads/${item_id}`);
    }catch (err){
        console.error('Error updating current bid:', err);
    }

}


module.exports.showBids = async(req,res) => {
    try {
        const id = req.params.id;
        // Fetch all bids for the item from the database
        const bids = await bidModel.find({ item: id }).sort({ time: 1 });
        const item = await itemModel.findById(id);
        const auctionEnd = item.auctionEnd.getTime();
        const uploadTime = new Date(auctionEnd - (48 * 60 * 60 * 1000));
        const amounts = bids.map(bid => bid.amount);
        const timestamps = bids.map(bid => {
            const diffInMillis = bid.time.getTime() - uploadTime.getTime();
            const hours = Math.floor(diffInMillis / (1000 * 60 * 60));
            const minutes = Math.floor((diffInMillis % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        });
        res.render("showBids", {bids,amounts,timestamps});
    } catch (error) {
        console.error('Error fetching bid data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports.openAd = async(req,res) => {
    const id = req.params.id;
    console.log(id);
    const ad = await itemModel.findById(req.params.id);
    console.log(ad);
    res.render("openAd", {ad});
}

module.exports.getnewAd = async(req,res) => {
    res.render('submitAd');
}


module.exports.feed = async(req,res) => {
    console.log(req.session.userId);
    try{
        const items = await itemModel.find();
        items.sort((a, b) => a.auctionEnd - b.auctionEnd);
        res.render('feed',{items});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}