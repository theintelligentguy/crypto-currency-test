const crypto = require('crypto')
const axios = require('axios')
const { simpleSwalApi } = require('../../../../configs/vars')
const { readJsonFile } = require('../../../../api/controllers/v1/functions')
let jsonData = readJsonFile('./fetching/simpleswap/links.json')

function createSign(message) {
  let sign = crypto.createHmac('sha512', '').update(JSON.stringify(message)).digest('hex');
  return sign
}

function createPostBody(message) {
  let messageData = {"jsonrpc": "2.0","id": "test","method": "getExchangeAmount","params": message}
  let sign = createSign(messageData)
  let headers = {"api-key": changelly_api, "sign": sign}
  return {body: headers, headers: headers}
}

function doRequest(message, newJson='') {
  let from = message.from
  let to = message.to
  let amount = message.amount
  if(newJson) {
    jsonData = newJson
  }
  let formattedUrl = jsonData.exchangeUrl.toString().replace('${amt}', amount).replace('${from}', from).replace('${to}', to).replace('${simpleSwalApi}', simpleSwalApi)
  return axios({url: formattedUrl, method: "GET"}).then((res) => {
    return simpleSwapAllPriceHandler(res.data)
  }).catch((e) => {
    return {error: true, stack: e}
  })
}

function simpleSwapAllPriceHandler(data) {
  if(!data) {
    data = 0
  }
  return {name: "Simple Swap", amount: parseFloat(data)}
}

module.exports = {
  createSign,
  createPostBody,
  doRequest,
  jsonData
}
