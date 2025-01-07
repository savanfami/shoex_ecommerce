const mongoose = require('mongoose');
require('dotenv').config();

const DBconnection = mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.log("Not connected to the database", err);
  });

module.exports = {
  DBconnection
};
