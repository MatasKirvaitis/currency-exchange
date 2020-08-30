const R = require('ramda');
const db = require('../../db')();

const getCurrencyList = async (req, res) => {
  try {
    const result = await db.rates.findAll();
    const formattedResult = formatResult(result);
    res.status(200).json(formattedResult);
    console.log('getCurrencyList success');
  } catch (error) {
    console.error('getCurrencyList error', error);
    res.status(500).json({});
  }
};

const formatResult = result => {
  const sortByNameCaseInsensitive = R.sortBy(R.compose(R.toLower, R.prop('name')));
  return sortByNameCaseInsensitive(result);
}


module.exports = getCurrencyList;
