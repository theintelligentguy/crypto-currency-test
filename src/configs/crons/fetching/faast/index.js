const crypto = require('crypto')
const axios = require('axios')
const { faaStFixedFee, faaStAffiliateMargin } = require('../../../../configs/vars')
const { readJsonFile } = require('../../../../api/controllers/v1/functions')
let jsonData = readJsonFile('./fetching/faast/links.json')

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

function doRequest(message, newJson = '') {
  let from = message.from
  let to = message.to
  let amount = message.amount
  let fromTo = from + "_" + to
  if(newJson) {
    jsonData = newJson
  }
  let formattedUrl = jsonData.exchangeUrl.toString().replace('${amt}', amount).replace('${from_to}', fromTo).replace('${faaStFixedFee}', faaStFixedFee).replace('${faaStAffiliateMargin}', faaStAffiliateMargin)
  return axios({url: formattedUrl, method: "GET"}).then((res) => {
    return faastAllPriceHandler(res.data, message)
  }).catch((e) => {
    return {error: true, stack: e}
  })
}

function faastAllPriceHandler(data, otherData) {
    let price = data.price
    let requestedAmt = parseFloat(otherData.amount)
    let amt = requestedAmt / price
    if(!amt) {
        amt = 0
    }
    return {name: "Faa.st", amount: parseFloat(amt).toFixed(7)}
}

module.exports = {
  createSign,
  createPostBody,
  doRequest,
  jsonData
}
