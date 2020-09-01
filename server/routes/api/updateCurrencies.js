const parser = require('xml2json');
const fetch = require('node-fetch');
const moment = require('moment');
const R = require('ramda');

const db = require('../../db')();

const LB_URL = 'http://www.lb.lt/webservices/fxrates/fxrates.asmx';
const getCurrentFxRatesXML = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getCurrentFxRates xmlns="http://www.lb.lt/WebServices/FxRates">
      <tp>EU</tp>
    </getCurrentFxRates>
  </soap:Body>
</soap:Envelope>`;
const getCurrencyListXML = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getCurrencyList xmlns="http://www.lb.lt/WebServices/FxRates" />
  </soap:Body>
</soap:Envelope>`;

const updateCurrencies = async (req, res) => {
  try {
    const currentDate = moment().format('YYYY-MM-DD');
    const updatedDate = await checkLastUpdated();
    const isBefore = moment(updatedDate).isBefore(currentDate);
    if (isBefore) {
      await updateDate(currentDate);
      await updateExchangeRates();
    }
    res.status(200).json('Success');
    console.log('Exchange rates are up to date');
  } catch (error) {
    console.error('This is an error');
    res.status(500).json({ error });
  }
};

const checkLastUpdated = async () => {
  try {
    const result = await db.renewed.find('dateUpdated');
    if (result && result.length > 0) {
      let updatedDate = result[0].date;
      return updatedDate;
    } else {
      let currentDate = moment().format('YYYY-MM-DD');
      await db.renewed.updateOne('dateUpdated', currentDate);
      return currentDate;
    }
  } catch (error) {
    console.error(error);
    throw new Error('Error while fetching data from db.renewed.find()');
  }
};

const updateDate = async (date) => {
  try {
    await db.renewed.updateOne('dateUpdated', date);
    console.log('Date updated successfully');
  } catch (error) {
    console.error(`Error updating date: ${date} `, error);
  }
};

const updateExchangeRates = async () => {
  const fxRates = await getCurrentFxRates();
  const currencyList = await getCurrencyList();
  const documents = prepareDocuments(fxRates, currencyList);
  await db.rates.deleteAll();
  return await db.rates.create(documents);
};

const getCurrentFxRates = async () => {
  try {
    const result = await fetch(LB_URL, {
      method: 'post',
      body: getCurrentFxRatesXML,
      headers: { 'Content-Type': 'text/xml' },
    });
    const extractedJSON = await extractJSON(result);
    return R.path(
      [
        'soap:Envelope',
        'soap:Body',
        'getCurrentFxRatesResponse',
        'getCurrentFxRatesResult',
        'FxRates',
        'FxRate',
      ],
      extractedJSON
    );
  } catch (error) {
    consle.error(error);
    throw new Error('Error while fetching currentFxRates');
  }
};

const getCurrencyList = async () => {
  try {
    const result = await fetch(LB_URL, {
      method: 'post',
      body: getCurrencyListXML,
      headers: { 'Content-Type': 'text/xml' },
    });
    const extractedJSON = await extractJSON(result);
    return R.path(
      [
        'soap:Envelope',
        'soap:Body',
        'getCurrencyListResponse',
        'getCurrencyListResult',
        'FxRates',
        'CcyNtry',
      ],
      extractedJSON
    );
  } catch (error) {
    consle.error(error);
    throw new Error('Error while fetching currentFxRates');
  }
};

const extractJSON = async (response) => {
  const text = await response.text();
  const jsonString = parser.toJson(text);
  return JSON.parse(jsonString);
};

const prepareDocuments = (fxRates, currencyList) => {
  let finalDocumentArray = [];
  let fxRatesArray = [];
  for (let rate of fxRates) {
    fxRatesArray.push(rate.CcyAmt[1]);
  }
  for (let rate of fxRatesArray) {
    let element = R.find(R.propEq('Ccy', rate.Ccy))(currencyList);
    if (element)
      finalDocumentArray.push({
        _id: rate.Ccy,
        rate: rate.Amt,
        name: element.CcyNm[1].$t,
      });
  }
  return finalDocumentArray;
};

module.exports = updateCurrencies;
