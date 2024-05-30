const http = require('http');
const app = require('./App');
require('dotenv').config()

const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port);