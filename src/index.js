const http = require('http')
const WebSocket = require('ws')
const app = require('./configs/express')
const { port, env } = require('./configs/vars')
const logger = require('./configs/logger');
const WebSockets = require('./configs/WebSockets')

//console.log(vars)
// Create server
const server = http.createServer(app)

//Starting WebSockets
WebSockets.start(server)

// listen to requests
server.listen(port, () => logger.info(`server started on port ${port} (${env})`));
