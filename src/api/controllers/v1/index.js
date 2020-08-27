const currency = require('./currency')
const exchange = require('./exchange')
const sockets = require('./sockets')
const transactions = require('./transactions')

module.exports = {
  currencyController: currency,
  exchangeController: exchange,
  socketController: sockets,
  transactionsController: transactions
}
