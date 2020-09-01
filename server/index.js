const compression = require('compression');
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');

const app = express();

const PORT = 3000;

app.enable('strict routing');
app.enable('trust proxy');

require('./db').init();

const api = require('./routes/api');

app.use(cors());
app.use(compression());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(express.static(path.join(__dirname, '../client/dist')));

app.use('/api', api);

app.use('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

http.createServer(app).listen(PORT, () => {
  console.log(`Currency-exchange is running on : ${PORT}`);
});
