const crypto = require('crypto')
const axios = require('axios')
const { godex_api } = require('../../../../configs/vars')
const { readJsonFile } = require('../../../../api/controllers/v1/functions')
let jsonData = readJsonFile('./fetching/godex/links.json')

function createSign(message) {
  let sign = crypto.createHmac('sha512', '').update(JSON.stringify(message)).digest('hex');
  return sign
}

function createPostBody(message) {
  let headers = {"Authorization": godex_api, "Content-Type": "application/json"}
  return {body: message, headers: headers}
}

function doRequest(message, newJson) {
  const { body, headers } = createPostBody(message)
  if(newJson) {
    jsonData = newJson
  }
  return axios({url: jsonData.exchangeUrl, headers: headers, method: "POST", data: body}).then((res) => {
    return godexAllPriceHandler(res.data)
  }).catch((e) => {
    return {error: true, stack: e}
  })
}

function godexAllPriceHandler(data) {
  let price = data.amount
  return {name: "Godex", amount: parseFloat(price)}
}

module.exports = {
  createSign,
  createPostBody,
  doRequest,
  jsonData
}
