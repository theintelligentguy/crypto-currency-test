const axios = require('axios')
const { changeNowApi, simpleSwalApi, faaStFixedFee, faaStAffiliateMargin } = require('../../../../configs/vars')

//3E5n1PMWXzhC17wdeYXoZhqZcndAnX454B BitCoin Addr

exports.getTransactions = async (req, res, next) => {
  let from = req.params.from
  let to = req.params.to
  let status = req.params.status
  let limit = req.params.limit
  let offset = req.params.offset
  let dateFrom = req.params.dateFrom
  let dateTo = req.params.dateTo
}

exports.createTransaction = async (req, res, next) => {
    // if(req.body.company.toString().toLowerCase() == "changenow") {
    //     let data = {
    //         "payinAddress": "0xe92B824A609B89145c0582cB68AED7D209b1aBc5",
    //         "payoutAddress": "3E5n1PMWXzhC17wdeYXoZhqZcndAnX454B",
    //         "payoutExtraId": "",
    //         "fromCurrency": "eth",
    //         "toCurrency": "btc",
    //         "refundAddress": "",
    //         "refundExtraId": "",
    //         "id": "912ce256c51ea3",
    //         "amount": 0.368399
    //     }
    //     let result = formatChangeNowCreateTransactionResp(data, req.body)
    //     return res.json(data)
    // }
    // if(req.body.company.toString().toLowerCase() == "simpleswap") {
    //     let data = {
    //         "id": "oCZfidx8Fa",
    //         "type": "fixed",
    //         "timestamp": "2021-02-15T11:31:56.133Z",
    //         "updated_at": "2021-02-15T11:31:56.135Z",
    //         "currency_from": "eth",
    //         "currency_to": "btc",
    //         "amount_from": "10",
    //         "expected_amount": "10",
    //         "amount_to": "0.3539035",
    //         "address_from": "0x588B76bB69402e707791C78e38985D7f1a300E00",
    //         "address_to": "3E5n1PMWXzhC17wdeYXoZhqZcndAnX454B",
    //         "extra_id_from": "",
    //         "extra_id_to": null,
    //         "user_refund_address": "",
    //         "user_refund_extra_id": "",
    //         "tx_from": "",
    //         "tx_to": "",
    //         "status": "waiting",
    //         "currencies": {
    //             "eth": {
    //                 "symbol": "eth",
    //                 "has_extra_id": false,
    //                 "extra_id": "",
    //                 "name": "Ethereum",
    //                 "warnings_from": [
    //                     "Please be careful not to deposit your ETH from a smart contract."
    //                 ],
    //                 "warnings_to": [
    //                     "Please be careful not to provide a smart contract as your ETH payout address."
    //                 ],
    //                 "validation_address": "^(0x)[0-9A-Fa-f]{40}$",
    //                 "validation_extra": null,
    //                 "address_explorer": "https://etherscan.io/address/{}",
    //                 "tx_explorer": "https://etherscan.io/tx/{}",
    //                 "confirmations_from": "1"
    //             },
    //             "btc": {
    //                 "symbol": "btc",
    //                 "has_extra_id": false,
    //                 "extra_id": "",
    //                 "name": "Bitcoin",
    //                 "warnings_from": [],
    //                 "warnings_to": [],
    //                 "validation_address": "^[13][a-km-zA-HJ-NP-Z1-9]{25,80}$|^(bc1)[0-9A-Za-z]{25,80}$",
    //                 "validation_extra": null,
    //                 "address_explorer": "https://blockchair.com/bitcoin/address/{}?from=simpleswap",
    //                 "tx_explorer": "https://blockchair.com/bitcoin/transaction/{}?from=simpleswap",
    //                 "confirmations_from": "1"
    //             }
    //         }
    //     }
    //     let result = formatSimpleSwapCreateTransactionResp(data)
    //     return res.json(result)
    // }
  try {
   let dataReceived = getDataByCompany(req.body)
   let url = getTransactionUrlByCompany(req.body)
   let result = await axios({url:url, data: dataReceived, method:"post"})
   let resultFormatted = formatCreateTransactionResp(result.data, req.body)
   return res.json(resultFormatted)
 }
 catch(e) {
   console.log(e)
   return res.status(500).json({error: true})
 }
}

exports.getStatus = async (req, res, next) => {
  let transaction_id = req.params.transaction_id
  try {
    let result = await axios.get(`https://api.changenow.io/v2/exchange/by-id?id=${transaction_id}`)
    return res.json(result)
  }
  catch(e) {
    return res.status(500).json({error: true})
  }
}

exports.blank = async (req, res, next) => {

}

function formatCreateTransactionResp(resp, body) {
  if(body.company.toString().toLowerCase() == "changenow") {
    return formatChangeNowCreateTransactionResp(resp, body)
  }
  if(body.company.toString().toLowerCase() == "simpleswap") {
    return formatSimpleSwapCreateTransactionResp(resp)
  }
  if(body.company.toString().toLowerCase() == "faast") {
    return formatFaaStCreateTransactionResp(resp)
  }
}

function formatChangeNowCreateTransactionResp(resp, body) {
  let formulaValue = resp.amount / body.amount
  let formulaText = 1 + " " + resp.fromCurrency.toString().toUpperCase() + " = " + formulaValue + " " + resp.toCurrency.toString().toUpperCase()
  return {
    payingAddress: resp.payinAddress,
    id: resp.id,
    destAddress: resp.payoutAddress,
    gettingAmt: resp.amount + " " + resp.toCurrency,
    requestedAmt: body.amount + " " + resp.fromCurrency,
    formula: formulaText
  }
}

function formatSimpleSwapCreateTransactionResp(resp) {
  let formulaValue = resp.amount_to / resp.amount_from
  let formulaText = 1 + " " + resp.currency_from.toString().toUpperCase() + " = " + formulaValue + " " + resp.currency_to.toString().toUpperCase()
  return {
    payingAddress: resp.address_from,
    id: resp.id,
    destAddress: resp.address_to,
    gettingAmt: resp.amount_to + " " + resp.currency_to,
    requestedAmt: resp.amount_from + " " + resp.currency_from,
    formula: formulaText
  }
}

function formatFaaStCreateTransactionResp(resp) {
    let formulaValue = resp.withdrawal_amount / resp.deposit_amount
    let formulaText = 1 + " " + resp.currency_from.toString().toUpperCase() + " = " + formulaValue + " " + resp.currency_to.toString().toUpperCase()
    return {
        payingAddress: resp.deposit_address,
        id: resp.swap_id,
        destAddress: resp.withdrawal_address,
        gettingAmt: resp.withdrawal_amount + " " + resp.withdrawal_currency,
        requestedAmt: resp.deposit_amount + " " + resp.deposit_currency,
        formula: formulaText
    }
}

function getDataByCompany(body) {
  let from = body.from
  let to = body.to
  let address = body.address
  let amount = body.amount
  let extraId = body.extraId
  let userId = body.userId
  let contactEmail = body.contactEmail
  let refundAddress = body.refundAddress
  let refundExtraId = body.refundExtraId
  let company = body.company
  let data = {}
  if(company.toString().toLowerCase() == "changenow") {
    data = {
        "from": from,
        "to": to,
        "address": address,
        "amount": amount,
        "extraId": extraId,
        "userId": userId,
        "contactEmail": contactEmail,
        "refundAddress": refundAddress,
        "refundExtraId": refundExtraId
    }
  }
  if(company.toString().toLowerCase() == "simpleswap") {
    data = {
        "currency_from": from,
        "currency_to": to,
        "address_to": address,
        "amount": amount,
        "extra_id_to": extraId,
        "userId": userId,
        "contactEmail": contactEmail,
        "refund_address": refundAddress,
        "refund_extra_id": refundExtraId
    }
    if(body.type == "fixed") {
        data.fixed = true
    }
  }
  
  if(company.toString().toLowerCase() == "faast") {
    data = {
      "deposit_amount": parseFloat(amount),
      "deposit_currency": from,
      "withdrawal_address": address,
      "deposit_currency": from,
      "withdrawal_currency": to,
      "refund_address": refundAddress,
      "affiliate_margin": faaStAffiliateMargin,
      "affiliate_fixed_fee": faaStFixedFee,
      "affiliate_id": "AmanSin002",
    }
  }
  console.log(data)
  return data
}

function getTransactionUrlByCompany(body) {
    let url = ''
    let type = body.type
    let company = body.company.toString().toLowerCase()
    if(company == "changenow") {
        if(type == "fixed") {
            url = `https://api.changenow.io/v1/transactions/fixed-rate/${changeNowApi}`
        }
        else {
          url = `https://api.changenow.io/v1/transactions/${changeNowApi}`
        }
    }
    if(company == "simpleswap") {
        url = `https://api.simpleswap.io/v1/create_exchange?api_key=${simpleSwalApi}`
    }
    if(company.toString().toLowerCase() == "faast") {
        url = "https://api.faa.st/api/v2/public/swap"
    }
    console.log(url)
    return url
}
