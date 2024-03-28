const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  time: {
    type: Date, // Type is Date to store date and time
    default: Date.now // Default value is the current date and time
  }

});

module.exports = mongoose.model('Bid', bidSchema);
