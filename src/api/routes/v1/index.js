const express = require('express')
const validator = require ('express-validator')

const currency = require('./currency')
const exchange = require('./exchange')
const transactions = require('./transactions')

const router = express.Router()

//API STATUS
router.get('/status', (req, res) => res.send('OK'));

//APIS
router.use('/currency', currency)
router.use('/exchange', exchange)
router.use('/transactions', transactions)

module.exports = router
