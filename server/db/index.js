const MongoStore = require('./mongo/MongoStore');

let db;
const getDb = () => {
  if (!db) {
    throw new Error('DB not initialized');
  }
  return db;
};

const init = () => {
  if (db) {
    return db;
  } else {
    db = new MongoStore();
  }
  return db;
};

module.exports = getDb;
module.exports.init = init;
