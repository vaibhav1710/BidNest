const mongoose = require('mongoose');
const mongoosastic = require('mongoose-elasticsearch-xp');
const { Client:Client7 } = require('es7');
const esclient = new Client7({ node: 'http://localhost:9200' });

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  auctionEnd: {
    type: Date // No longer marked as required
  },
  bids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  latestbidder:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  photoUrl: {
    type: String,
    required: true
  },
  currentBid: {
    type: Number,
    required:true
  }
});

productSchema.plugin(mongoosastic, {
  esclient, // Elasticsearch client
  index: 'products' // Elasticsearch index name
});

module.exports = mongoose.model('Product', productSchema);

