const mongoose = require('mongoose')

/**
 * Exchange Schema
 * @private
 */
const company = new mongoose.Schema({
  from: { type: String },
  to: { type: String },
  company: { type: String },
  rate: { type: String },
  error: { type: Boolean, default: false }
}, {
  timestamps: true,
});


/**
 * @typedef User
 */
module.exports = mongoose.model('company', company);
