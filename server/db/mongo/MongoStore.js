const mongoose = require('mongoose');
const { rateSchema, renewedSchema, logsSchema } = require('./schemas');

class MongoStore {
  constructor() {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    };
    this.mongoose = new mongoose.Mongoose();
    this.mongoose
      .connect(
        'mongodb+srv://admin:8N8cuX2A9yGrHyb@cluster0.lesvm.mongodb.net/currency-exchange?retryWrites=true&w=majority',
        options
      )
      .then((db) => {
        console.log('Connected to MongoDB successfully');
        this.Rates = db.model('rates', rateSchema);
        this.Renewed = db.model('renewed', renewedSchema);
        this.Logs = db.model('logs', logsSchema);
      })
      .catch((error) => {
        console.error('Unable to connect to MongoDB', error);
      });
  }

  get rates() {
    return {
      findAll: async () => {
        try {
          const result = await this.Rates.find();
          return result;
        } catch (error) {
          console.error('rates.findAll failed to retrieve data', error);
          return error;
        }
      },
      create: async (rate) => {
        try {
          return await this.Rates.create(rate);
        } catch (error) {
          console.error('rates.create failed to insert data', error);
          return error;
        }
      },
      deleteOne: async (id) => {
        try {
          return await this.Rates.deleteOne(id);
        } catch (error) {
          console.error('rates.deleteOne failed to delete a document', error);
          return error;
        }
      },
      deleteAll: async () => {
        try {
          return await this.Rates.deleteMany({});
        } catch (error) {
          console.error('rates.deleteAll failed to delete a document', error);
          return error;
        }
      },
    };
  }

  get renewed() {
    return {
      find: async (id) => {
        try {
          return await this.Renewed.find({ _id: id });
        } catch (error) {
          console.error('renewed.findAll failed to retrieve data', error);
          return error;
        }
      },
      updateOne: async (id, date) => {
        try {
          return await this.Renewed.findOneAndUpdate(
            { _id: id },
            { date },
            { upsert: true }
          );
        } catch (error) {
          console.error('renewed.updateOne failed to update a document', error);
          return error;
        }
      },
    };
  }

  get logs() {
    return {
      create: async (log) => {
        try {
          return await this.Logs.create(log);
        } catch (error) {
          console.error('logs.create failed to create a document', error);
        }
      },
    };
  }
}

module.exports = MongoStore;
