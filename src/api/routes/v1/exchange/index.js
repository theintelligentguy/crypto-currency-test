const express = require('express')
const validator = require ('express-validator')
const { exchangeController } = require('../../../controllers/v1')

const router = express.Router()

router.route('/estimate/:amount/:from/:to/:type?').get(exchangeController.estimate)
router.route('/getBestPrice/:amount/:from/:to/:type?').get(exchangeController.getBestPrice)
router.route('/getAllPrices/:amount/:from/:to/:type?').get(exchangeController.getAllPrices)
router.route('/getByCompany/:company/:amount/:from/:to/:type?').get(exchangeController.getByCompany)
router.route('/getMinimum/:from/:to/').get(exchangeController.getMinimumExchangeAmount)
router.route('/validateAddress/:currency/:address').get(exchangeController.validateAddress)

module.exports = router
