const { socketController } = require('../../../controllers/v1')

function checkSocketMessage(message, ws) {
  message = messageParser(message)
  let request = findRequest(message)
  switch(request) {
    case 'status':
      return socketController.status(message, ws)
      break

    case 'hello':
      return socketController.hello(message, ws)
      break
      
    case 'getCurrencies':
      return socketController.getCurrencies(message, ws)
      break
  }
}

function messageParser(message) {
  try {
    message = JSON.parse(message)
  }
  catch(e) {}
  return message
}

function findRequest(message) {
  if(message.request) {
    return message.request
  }
  return message
}

module.exports = { checkSocketMessage }
