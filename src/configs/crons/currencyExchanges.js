const fs = require('fs')
const cron = require('node-cron')
const axios = require('axios')
const cliProgress = require('cli-progress')
const { Currency, Exchanges } = require('../../api/models/')
const mongoose = require('../mongoose')
const { changeNow, simpleSwap, faast, changelly, changeHero, godex } = require('./fetching')

let currencies = new Map()
let totalExchangesN = 0
let dataCollected = []
let totalAdded = 0

async function getExchanges() {
  await mongoose.connect()
  let currencies = await Currency.find()
  let count = currencies.length
  const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true
  }, cliProgress.Presets.shades_grey);
  let totalExchanges = count * count
  totalExchangesN = totalExchanges
  for(let i = 0; i < count; i++) {
    let currency1Data = currencies[i]
    let currency1Ticker = currency1Data.ticker
    let currencies2 = await Currency.find({ticker: { "$ne": currency1Ticker }})
    let count2 = currencies2.length
    let message = { from: currency1Ticker.toString().toUpperCase(), to: 'ETH', amount: 1 }
    changeNow.doRequest(message, changeNow.jsonData).then((res) => { console.log(res) }).catch((e) => { console.log('err'); console.log(e) })
  }
}

function exchangeHandler(message, company, res, bar) {
  if(res.amount) {
    let fileName = "./changenow.json"
    let exchangeData = {
      from: message.from,
      to: message.to,
      company: company,
      rate: res.amount.toString(),
    }
    if(totalAdded < totalExchangesN) {
      dataCollected.push(exchangeData)
      totalAdded++
      bar.increment()
    }
    else if(totalAdded == totalExchangesN) {
      dataCollected.push(exchangeData)
      addData(dataCollected, fileName)
    }
  }
}

function readAndAppend(data, filename, bar) {
  let fileContent = fs.readFileSync(filename)
  let jsonData = JSON.parse(fileContent.toString())
  jsonData.push(data)
  jsonData = JSON.stringify(jsonData)
  fs.writeFileSync(filename, jsonData)
  bar.increment()
}

function addData(data, filename, bar) {
  let jsonData = []
  jsonData.push(data)
  jsonData = JSON.stringify(jsonData)
  console.log(jsonData)
  fs.writeFileSync(filename, jsonData)
}

async function errorHandler(company, res, bar) {
  bar.increment()
  totalAdded++
  console.log('error')
  console.log(res)
}

async function fetchCurrencies() {
  await mongoose.connect()
  let res = await axios.get('https://api.changenow.io/v1/currencies?active=true')
  let currencies = res.data
  let count = currencies.length
  const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  bar1.start(count, 0)
  for(let i = 0; i < count; i++) {
    let currency = currencies[i]
    let ticker = currency.ticker
    let name = currency.name
    let image = currency.image
    let currencyData = new Currency({
      ticker: ticker,
      name: name,
      image: image
    })
    await currencyData.save()
    if(currencyData._id) {
      bar1.update(i)
    }
    if(count - i == 1) {
      bar1.update(count)
      setTimeout(() => { bar1.stop(); console.log('Currency added!!!') })
    }
  }
}

getExchanges()
