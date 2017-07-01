const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

const cfg = require('../config.json')

// global.db = mongoose.createConnection(cfg.mongo.host, { server: { poolSize: cfg.mongo.pollSize } });

mongoose.connect(cfg.mongo.host, { server: { poolSize: cfg.mongo.pollSize } })
if (global.dev) {
  mongoose.set('debug', true)
}

exports.item = require('./item')
exports.category = require('./category')
exports.page = require('./page')
