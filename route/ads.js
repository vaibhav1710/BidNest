const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const productController = require("../controllers/productController");
const isloggedin = require("../middlewares/loggedin");
const multer = require("multer");
const storage = require("../cloudinary");
const upload = multer(storage);

router.post("/ads" , isloggedin , upload.single('photoUrl') ,productController.newAd);
router.get("/newads" , isloggedin , productController.getnewAd);
router.get("/feed", isloggedin, productController.feed );
router.get("/ads/:id", isloggedin , productController.openAd);
router.post("/bid/:id", isloggedin, productController.updatebid);
router.get("/ads/:id/bids", isloggedin,  productController.showBids) ; 
router.get('/search', productController.searchProducts);



module.exports = router;