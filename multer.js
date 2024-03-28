
require('dotenv').config();
const multer = require('multer');
c
// Configure Multer storage for Cloudinary
const storage = multer.diskStorage({
    filename: function(req,file,cb){
        cb(null, file.originalname)
    }
})

// Initialize Multer with Cloudinary storage
const upload = multer({ storage: storage });

module.exports = upload;