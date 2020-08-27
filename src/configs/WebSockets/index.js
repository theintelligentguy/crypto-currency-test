const WebSocket = require('ws')
const { checkSocketMessage } = require('../../api/routes/v1/sockets')

const start = (server) => {
  console.log('Starting WebSocket')
  const wss = new WebSocket.Server({ server, path:"/ws" })
  wss.on('connection', function connection(ws) {
    ws.on('message', function (message) {
      checkSocketMessage(message, ws)
    })
  })
  return wss
}

module.exports = { start }
