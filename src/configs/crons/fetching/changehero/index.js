const crypto = require('crypto')
const axios = require('axios')
const { change_hero_api, change_hero_secret } = require('../../../../configs/vars')
const { readJsonFile } = require('../../../../api/controllers/v1/functions')
let jsonData = readJsonFile('./fetching/changehero/links.json')

function createSign(message) {
  let sign = crypto.createHmac('sha512', '').update(JSON.stringify(message)).digest('hex');
  return sign
}

function createPostBody(message) {
  let messageData = {"jsonrpc": "2.0","id": "test","method": "getExchangeAmount","params": message}
  let sign = createSign(messageData)
  let headers = {"api-key": change_hero_api, "sign": sign}
  return {body: headers, headers: headers}
}

function doRequest(message, newJson='') {
  const { body, headers } = createPostBody(message)
  if(newJson) {
    jsonData = newJson
  }
  return axios({url: jsonData.apiUrl, headers: headers, method: "POST", data: body}).then((res) => {
    return changeHeroAllPriceHandler(res.data)
  }).catch((e) => {
    return {error: true, stack: e}
  })
}

function changeHeroAllPriceHandler(data) {
  let parsedData = data.result
  let price = parsedData
  return {name: "Change Hero", amount: parseFloat(price)}
}

module.exports = {
  createSign,
  createPostBody,
  doRequest,
  jsonData
}
