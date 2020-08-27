const crypto = require('crypto')
const axios = require('axios')
const { changelly_api, changelly_secret } = require('../../../../configs/vars')
const { readJsonFile } = require('../../../../api/controllers/v1/functions')
let jsonData = readJsonFile('./fetching/changelly/links.json')

function createSign(message) {
  let sign = crypto.createHmac('sha512', changelly_secret).update(JSON.stringify(message)).digest('hex');
  return sign
}

function createPostBody(message) {
  let changellyMessage = {"jsonrpc": "2.0","id": "test","method": "getExchangeAmount","params": message}
  let changellySign = createSign(changellyMessage)
  let changellyHeaders = {"api-key": changelly_api, "sign": changellySign}
  return {body: changellyMessage, headers: changellyHeaders}
}

function doRequest(message, newJson='') {
  const { body, headers } = createPostBody(message)
  if(newJson) {
    jsonData = newJson
  }
  return axios({url: jsonData.apiUrl, headers: headers, method: "POST", data: body}).then((res) => {
    return (res.data)
  }).catch((e) => {
    return {error: true, stack: e}
  })
}

function changellyAllPriceHandler(data) {
  let parsedData = data.result
  let price = parsedData
  return {name: "Changelly", amount: parseFloat(price)}
}

module.exports = {
  createSign,
  createPostBody,
  doRequest,
  jsonData
}
