const mongoose = require('mongoose')

/**
 * Exchange Schema
 * @private
 */
const currencies = new mongoose.Schema({
  ticker: { type: String },
  name: { type: String },
  image: { type: String }
}, {
  timestamps: true,
});


/**
 * @typedef User
 */
module.exports = mongoose.model('currencies', currencies);
