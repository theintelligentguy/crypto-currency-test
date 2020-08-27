const path = require('path')
const vars = require('../../../../configs/vars')
const { Currency } = require('../../../models')

exports.status = async (message, ws) => {
  let obj = { request: 'status', message: 'WebSockets are working fine :)' }
  return sendMessage(ws, obj)
}

exports.hello = async (message, ws) => {
  let obj = { request: 'hello', message: 'Hi there!!!' }
  return sendMessage(ws, obj)
}

exports.getCurrencies = async (message, ws) => {
  let currencies = await Currency.find()
  let obj = { request: 'currencies', message: currencies }
  return sendMessage(ws, obj)
}

function sendMessage(ws, message) {
  try {
    message = JSON.stringify(message)
  }
  catch(e) {}
  ws.send(message)
}
