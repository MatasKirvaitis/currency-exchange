const express = require('express');
const router = express.Router();

const currencyList = require('./currencyList');
const updateCurrencies = require('./updateCurrencies');
const collectLogs = require('./collectLogs');

router.get('/currencyList', currencyList);
router.get('/updateCurrencies', updateCurrencies);
router.post('/collectLogs', collectLogs);

module.exports = router;
