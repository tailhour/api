const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

const cfg = require('../config.json')

mongoose.connect(cfg.mongo.host, { server: { poolSize: cfg.mongo.pollSize } })
if (global.dev) {
  mongoose.set('debug', true)
}

exports.item = require('./item')
exports.category = require('./category')
