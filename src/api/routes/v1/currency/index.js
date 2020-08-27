const axios = require('axios')

const express = require('express')
const validator = require ('express-validator')
const { currencyController } = require('../../../controllers/v1')

const router = express.Router()
router.route('/getCurrency').get(currencyController.getCurrency)
router.route('/getCurrencyTo/:ticker').get(currencyController.getCurrencyTo)
router.route('/getCurrencyInfo/:ticker').get(currencyController.getCurrencyInfo)
router.route('/getPairs').get(currencyController.getPairs)
router.route('/test').get(currencyController.test)

module.exports = router
