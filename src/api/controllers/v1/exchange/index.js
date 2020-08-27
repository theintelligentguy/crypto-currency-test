const axios = require('axios')
const lodash = require('lodash')
const { changeNowApi, simpleSwalApi, faaStFixedFee, faaStAffiliateMargin, changelly_api, changelly_secret, godex_api, change_hero_api, change_hero_secret } = require('../../../../configs/vars')
const crypto = require('crypto')

exports.estimate = async (req, res, next) => {
  let amt = req.params.amount
  let from = req.params.from
  let to = req.params.to
  let type = req.params.type
  let from_to = from+"_"+to
  let url = ''
  if(type == "fixed") {
    url = `https://api.changenow.io/v1/exchange-amount/fixed-rate/${amt}/${from_to}/?api_key=${changeNowApi}`
  }
  else {
    url = `https://api.changenow.io/v1/exchange-amount/${amt}/${from_to}/?api_key=${changeNowApi}`
  }
  let result = await axios.get(url)
  return res.json(result.data)
}

exports.getBestPrice = async (req, res, next) => {
  let amt = req.params.amount
  let from = req.params.from
  let to = req.params.to
  let type = req.params.type
  let from_to = from+"_"+to
  let urls = []
  let results = []

  //Changelly Custom functions
  let changellyMessage = {"jsonrpc": "2.0","id": "test","method": "getExchangeAmount","params": {"from": from,"to": to, "amount": amt}}
  let changellySign = createChangellySign(changellyMessage)
  let changellyHeaders = {"api-key": changelly_api, "sign": changellySign}

  //Change Hero Custom functions
  let changeHeroMessage = {"jsonrpc": "2.0","id": "test","method": "getExchangeAmount","params": {"from": from,"to": to, "amount": amt}}
  let changeHeroSign = createChangeHeroSign(changellyMessage)
  let changeHeroHeaders = {"api-key": change_hero_api}

  //Godex data
  let godexBody = {from: to.toString().toUpperCase(), to: from.toString().toUpperCase(), amount: amt.toString()}
  let godexHeaders = {"Authorization": godex_api, "Content-Type": "application/json"}
  //console.log(godexBody)
  //console.log(godexHeaders)
  if(type == "fixed") {
    urls[0] = {url: `https://api.changenow.io/v1/exchange-amount/fixed-rate/${amt}/${from_to}/?api_key=${changeNowApi}`, handler: changeNowBestPriceHandler, disabled: false}
//    urls[1] = {url: `https://api.simpleswap.io/v1/get_estimated?api_key=${simpleSwalApi}&fixed=true&currency_from=${from}&currency_to=${to}&amount=${amt}`, handler: simpleSwapBestPriceHandler, disabled: false}
//    urls[2] = {url: `https://api.faa.st/api/v2/public/price/${from_to}?&affiliate_fixed_fee=${faaStFixedFee}&affiliate_margin=${faaStAffiliateMargin}`, handler: faastBestPriceHandler, disabled: false}
//    urls[3] = {url: `https://api.changelly.com`, handler: changellyBestPriceHandler, headers: changellyHeaders, method: "POST", body: changellyMessage, disabled: true}
//    urls[4] = {url: "https://api.changehero.io/v2/", handler: changeHeroBestPriceHandler, headers: changellyHeaders, method: "POST", disabled: false}
//    urls[5] = {url: "https://api.godex.io/api/v1/info-revert", handler: godexBestPriceHandler, headers: godexHeaders, method: "POST", body: godexBody, disabled: false}
  }
  else {
    urls[0] = {url: `https://api.changenow.io/v1/exchange-amount/${amt}/${from_to}/?api_key=${changeNowApi}`, handler: changeNowBestPriceHandler, disabled: false}
//    urls[1] = {url: `https://api.simpleswap.io/v1/get_estimated?api_key=${simpleSwalApi}&fixed=false&currency_from=${from}&currency_to=${to}&amount=${amt}`, handler: simpleSwapBestPriceHandler, disabled: false}
//    urls[2] = {url: `https://api.faa.st/api/v2/public/price/${from_to}?&affiliate_margin=${faaStAffiliateMargin}`, handler: faastBestPriceHandler, disabled: false}
//    urls[3] = {url: `https://api.changelly.com`, handler: changellyBestPriceHandler, headers: changellyHeaders, method: "POST", body: changellyMessage, disabled: false}
//    urls[4] = {url: "https://api.changehero.io/v2/", handler: changeHeroBestPriceHandler, headers: changeHeroHeaders, method: "POST", disabled: true}
//    urls[5] = {url: "https://api.godex.io/api/v1/info-revert", handler: godexBestPriceHandler, headers: godexHeaders, method: "POST", body: godexBody, disabled: false}
  }

  let count = urls.length
    for(let i = 0; i < count; i++) {
      let urlData = urls[i]
      let url = urlData.url
      let handler = urlData.handler
      if(!urlData.disabled) {
        try {
          let headers = urlData.headers
          let method = urlData.method
          if(!method) {
            method = 'GET'
          }
          let body = urlData.body
          let result = await axios({url: url,headers: headers,method: method,data: body})
          let resp = handler(result.data, req.params)
          results.push(resp)
        }
        catch(e) {
          console.log(url)
          console.log(e)
          results.push(0)
        }
      }
    }
    return res.json(results)
}

exports.getByCompany = async (req, res, next) => {
  let amt = req.params.amount
  let from = req.params.from
  let to = req.params.to
  let company = req.params.company
  let type = req.params.type
  let from_to = from+"_"+to
  let url = ''
  let formattedFunc = ''
  if(company.toString().toLowerCase() == "changenow") {
    formattedFunc = changeNowCompanyPriceHandler
    if(type == "fixed") {
      url = `https://api.changenow.io/v1/exchange-amount/fixed-rate/${amt}/${from_to}/?api_key=${changeNowApi}`
    }
    else {
      url = `https://api.changenow.io/v1/exchange-amount/${amt}/${from_to}/?api_key=${changeNowApi}`
    }
  }

  if(company.toString().toLowerCase() == "simpleswap") {
    formattedFunc = simpleSwapCompanyPriceHandler
    if(type == "fixed") {
      url = `https://api.simpleswap.io/v1/get_estimated?api_key=${simpleSwalApi}&fixed=true&currency_from=${from}&currency_to=${to}&amount=${amt}`
    }
    else {
      url = `https://api.simpleswap.io/v1/get_estimated?api_key=${simpleSwalApi}&fixed=false&currency_from=${from}&currency_to=${to}&amount=${amt}`
    }
  }
  //?hostApiKey=frdxpoefpdn5vdsym6ktytm3oaj48wbw8gct34vy
  if(company.toString().toLowerCase() == "faast") {
    formattedFunc = FaaStCompanyPriceHandler
    url = `https://api.faa.st/api/v2/public/price/${from_to}?&affiliate_margin=${faaStAffiliateMargin}`
  }
  try {
    let result = await axios.get(url)
    let resultFormatted = formattedFunc(result.data, req.params)
    return res.json(resultFormatted)
  }
  catch(e) {
    return res.status(500).json({error: true})
  }
}

exports.getAllPrices = async (req, res, next) => {
  let amt = req.params.amount
  let from = req.params.from
  let to = req.params.to
  let type = req.params.type
  let from_to = from+"_"+to
  let urls = []
  let results = []

  //Changelly Custom functions
  let changellyMessage = {"jsonrpc": "2.0","id": "test","method": "getExchangeAmount","params": {"from": from,"to": to, "amount": amt}}
  let changellySign = createChangellySign(changellyMessage)
  let changellyHeaders = {"api-key": changelly_api, "sign": changellySign}

  //Change Hero Custom functions
  let changeHeroMessage = {"jsonrpc": "2.0","id": "test","method": "getExchangeAmount","params": {"from": from,"to": to, "amount": amt}}
  let changeHeroSign = createChangeHeroSign(changellyMessage)
  let changeHeroHeaders = {"api-key": changelly_api, "sign": changellySign}

  //Godex data
  let godexBody = {from: to.toString().toUpperCase(), to: from.toString().toUpperCase(), amount: amt.toString()}
  let godexHeaders = {"Authorization": godex_api}

  console.log(godexBody)
  console.log(godexHeaders)

  if(type == "fixed") {
    urls[0] = {url: `https://api.changenow.io/v1/exchange-amount/fixed-rate/${amt}/${from_to}/?api_key=${changeNowApi}`, handler: changeNowAllPriceHandler}
    urls[1] = {url: `https://api.simpleswap.io/v1/get_estimated?api_key=${simpleSwalApi}&fixed=true&currency_from=${from}&currency_to=${to}&amount=${amt}`, handler: simpleSwapAllPriceHandler}
    urls[2] = {url: `https://api.faa.st/api/v2/public/price/${from_to}?&affiliate_fixed_fee=${faaStFixedFee}&affiliate_margin=${faaStAffiliateMargin}`, handler: faastAllPriceHandler}
    urls[3] = {url: `https://api.changelly.com`, handler: changellyAllPriceHandler, headers: changeHeroHeaders, method: "POST", body: changeHeroMessage}
    urls[4] = {url: "https://api.changehero.io/v2/", handler: changeHeroBestPriceHandler, headers: changellyHeaders, method: "POST", disabled: true}
    urls[5] = {url: "https://api.godex.io/api/v1/info-revert", handler: godexAllPriceHandler, headers: godexHeaders, method: "POST", body: godexBody}
  }
  else {
    urls[0] = {url: `https://api.changenow.io/v1/exchange-amount/${amt}/${from_to}/?api_key=${changeNowApi}`, handler: changeNowAllPriceHandler}
    urls[1] = {url: `https://api.simpleswap.io/v1/get_estimated?api_key=${simpleSwalApi}&fixed=false&currency_from=${from}&currency_to=${to}&amount=${amt}`, handler: simpleSwapAllPriceHandler}
    urls[2] = {url: `https://api.faa.st/api/v2/public/price/${from_to}?&affiliate_margin=${faaStAffiliateMargin}`, handler: faastAllPriceHandler}
    urls[3] = {url: `https://api.changelly.com`, handler: changellyAllPriceHandler, headers: changeHeroHeaders, method: "POST", body: changeHeroMessage}
    urls[4] = {url: "https://api.changehero.io/v2/", handler: changeHeroBestPriceHandler, headers: changellyHeaders, method: "POST", disabled: true}
    urls[5] = {url: "https://api.godex.io/api/v1/info-revert", handler: godexAllPriceHandler, headers: godexHeaders, method: "POST", body: godexBody}
  }

  let count = urls.length
  for(let i = 0; i < count; i++) {
    let urlData = urls[i]
    let url = urlData.url
    let handler = urlData.handler
    if(!urlData.disabled) {
      try {
        let headers = urlData.headers
        let method = urlData.method
        if(!method) {
          method = 'GET'
        }
        let body = urlData.body
        let result = await axios({url: url,headers: headers,method: method,data: body})
        let resp = handler(result.data, req.params)
        if(parseFloat(resp.amount)) {
          results.push(resp)
        }
      }
      catch(e) { console.log(e) }
    }
  }
  if(!lodash.isEmpty(results)) {
    return res.json(results)
  }
  else {
    return res.status(500).json({error: true})
  }
}

exports.getMinimumExchangeAmount = async (req, res, next) => {
  let from = req.params.from
  let to = req.params.to
  let from_to = from+"_"+to
  let result = await axios.get(`https://api.changenow.io/v1/min-amount/${from_to}?api_key=${changeNowApi}`)
  return res.json(result.data)
}

exports.validateAddress = async (req, res, next) => {
  let currency = req.params.currency
  let address = req.params.address
  try {
    let result = await axios.get(`https://api.changenow.io/v2/validate/address?currency=${currency}&address=${address}`)
    return res.json(result.data)
  }
  catch(e) {
    return res.status(500).json({error: true})
  }
}

//Price Handler
function changeNowBestPriceHandler(data) {
  if(!data) {
    data.estimatedAmount = 0
  }
  return parseFloat(data.estimatedAmount)
}

function simpleSwapBestPriceHandler(data) {
  if(!data) {
    data = 0
  }
  return parseFloat(data)
}

function faastBestPriceHandler(data, otherData) {
    let price = data.price
    let requestedAmt = otherData.amount
    let amt = requestedAmt / price
    return parseFloat(amt)
}

function changellyBestPriceHandler(data, otherData) {
    let parsedData = data.result
    let price = parsedData
    return parseFloat(price)
}

function godexBestPriceHandler(data, otherData) {
    console.log(data)
    let price = data.amount
    return parseFloat(price)
}

function changeHeroBestPriceHandler(data, otherData) {
    let parsedData = data.result
    let price = parsedData
    return parseFloat(price)
}

//All Price Handler
function changeNowAllPriceHandler(data) {
  if(!data) {
    data.estimatedAmount = 0
  }
  return {name: "Change Now", amount: parseFloat(data.estimatedAmount)}
}

function simpleSwapAllPriceHandler(data) {
  if(!data) {
    data = 0
  }
  return {name: "Simple Swap", amount: parseFloat(data)}
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

function changellyAllPriceHandler(data) {
  let parsedData = data.result
  let price = parsedData
  return {name: "Changelly", amount: parseFloat(price)}
}

function godexAllPriceHandler(data) {
  let price = data.amount
  return {name: "Godex", amount: parseFloat(price)}
}

function changeHeroAllPriceHandler(data) {
  let parsedData = data.result
  let price = parsedData
  return {name: "Change Hero", amount: parseFloat(price)}
}

// Company Price handlers
function changeNowCompanyPriceHandler(data, otherData) {
  if(!data) {
    data.estimatedAmount = 0
  }
  let amt = parseFloat(data.estimatedAmount)
  let amtFormatted = amt+" "+otherData.to.toString().toUpperCase()
  let originalAmt = otherData.amount
  let originalFormatted = originalAmt+" "+otherData.from.toString().toUpperCase()
  return {name: "Change Now", originalFormatted: originalFormatted, amtFormatted: amtFormatted}
}

function simpleSwapCompanyPriceHandler(data, otherData) {
  if(!data) {
    data = 0
  }
  let amt = parseFloat(data)
  let amtFormatted = amt+" "+otherData.to.toString().toUpperCase()
  let originalAmt = otherData.amount
  let originalFormatted = originalAmt+" "+otherData.from.toString().toUpperCase()
  return {name: "Simple Swap", originalFormatted: originalFormatted, amtFormatted: amtFormatted}
}

function FaaStCompanyPriceHandler(data, otherData) {
    let price = data.price
    let requestedAmt = otherData.amount
    let originalFormatted = requestedAmt+" "+otherData.from.toString().toUpperCase()
    let amt = requestedAmt / price
    let amtFormatted = amt+" "+otherData.to.toString().toUpperCase()
    return {name: "Faa.st", originalFormatted: originalFormatted, amtFormatted: amtFormatted}
}

function changellyCompanyPriceHandler(data, otherData) {
  let parsedData = data.result
  let price = parseFloat(parsedData)
  return {name: "Changelly", originalFormatted: originalFormatted, amtFormatted: price}
}

function godexCompanyPriceHandler(data, otherData) {
  let price = parseFloat(data.amount)
  return {name: "Godex", originalFormatted: originalFormatted, amtFormatted: price}
}

function changellyCompanyPriceHandler(data, otherData) {
  let parsedData = data.result
  let price = parseFloat(parsedData)
  return {name: "Change Hero", originalFormatted: originalFormatted, amtFormatted: price}
}

//Custom function to create changelly tokens
function createChangellySign(message) {
  let sign = crypto.createHmac('sha512', changelly_secret).update(JSON.stringify(message)).digest('hex');
  return sign
}

function createChangeHeroSign(message) {
  let sign = crypto.createHmac('sha512', '').update(JSON.stringify(message)).digest('hex');
  return sign
}
