const db = require('../../db')();
const moment = require('moment');
const ObjectId = require('mongodb').ObjectID;

const postLogs = async (req, res) => {
    try {
        const timestamp = moment().toISOString();
        const id = ObjectId().toString();
        let document = {
            _id: id,
            ...req.body,
            timestamp
        }
        await db.logs.create(document);
        res.status(200).json({});
    } catch(error) {
        console.error('postLogs error', error);
        res.status(500).json({});
    }
}

module.exports = postLogs;