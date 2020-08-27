const express = require('express')
const validator = require ('express-validator')
const { transactionsController } = require('../../../controllers/v1')

const router = express.Router()

router.route('/createTransaction').post(transactionsController.createTransaction)
router.route('/getStatus/:transaction_id').get(transactionsController.getStatus)

module.exports = router
