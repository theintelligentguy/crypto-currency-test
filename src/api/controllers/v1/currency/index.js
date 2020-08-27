const axios = require('axios')
const crypto = require('crypto')
const { changeNowApi } = require('../../../../configs/vars')
const requestData = {
    affiliate_margin: 1,
    affiliate_id: "AmanSin002"
}
const requestJSON = JSON.stringify(requestData)
const AFFILIATE_ID = "AmanSin002"
const nonce = String(Date.now())
const signature = crypto.createHmac('sha256', '9904bf5506dc9043f408d86000777b27ba36').update(nonce + requestJSON).digest('hex')

exports.getCurrency = async (req, res, next) => {
  let fixedRate = req.params.fixedRate
  if(!fixedRate) {
    fixedRate = false
  }
  else {
    fixedRate = true
  }
  try {
    let currencies = await axios.get(`https://api.changenow.io/v1/currencies?active=true&fixedRate=${fixedRate}`)
    return res.json(currencies.data)
  }
  catch(e) {
    return res.status(500).json({error: true})
  }
}

exports.getCurrencyTo = async (req, res, next) => {
  let ticker = req.params.ticker
  let fixedRate = req.params.fixedRate
  if(!fixedRate) {
    fixedRate = false
  }
  else {
    fixedRate = true
  }
  if(ticker) {
    try {
      let currencies = await axios.get(`https://api.changenow.io/v1/currencies?active=true&fixedRate=${fixedRate}`)
      return res.json(currencies.data)
    }
    catch(e) {
      return res.status(500).json({error: true})
    }
  }
}

exports.getCurrencyInfo = async (req, res, next) => {
  let ticker = req.params.ticker
  if(ticker) {
    try {
      let currencyData = await axios.get(`https://api.changenow.io/v1/currencies/${ticker}`)
      return res.json(currencyData.data)
    }
    catch(e) {
      return res.status(500).json({error: true})
    }
  }
  else {
    return res.statu(406).json({error: true, message: "Ticker is required"})
  }
}

exports.getPairs = async (req, res, next) => {
  try {
    let result = await axios.get(`https://api.changenow.io/v1/market-info/available-pairs/?includePartners=false`)
    return res.json(result.data)
  }
  catch(e) {
    return res.status(500).json({error: true})
  }
}

exports.test = async (req, res, next) => {
    console.log("Hello")
    axios({
      url: 'https://testapi.faa.st',
      method: "POST",
      headers: {
        'affiliate-id': AFFILIATE_ID,
        nonce: nonce,
        signature: signature
      },
      data: requestData
    }).then((res) => {console.log(res)}).catch((e) => {console.log(e)})
}

exports.blank = async (req, res, next) => {

}
