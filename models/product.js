const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  photos: [{
    photoId: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
