const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
const Schema = mongoose.Schema

const Promise = require('bluebird')

const cfg = require('../config.json')

const exportModel = {};

var catSchema = new Schema({
  title: String,
  image: String,
  total: { type: Number, default: 0 },
  categoryId: { type: Number, default: 0 },
  created: { type: Date, default: Date.now }
}, { versionKey: false })

let catModel = mongoose.model('category', catSchema)

exportModel.name = "category"

exportModel.get = function(cb) {
  return new Promise(function (resolve, reject) {
  	catModel.find().then(function (catData) {
  	  resolve(catData)
  	})
  })
}

exportModel.inc = function(categoryId, cb) {
  return new Promise(function(resolve, reject) {
    catModel.findOneAndUpdate(
    	{ categoryId: categoryId }, { $inc: { total: 1 } }
    ).then(function(incData) {
      resolve(incData)
    })
  })
}

exportModel.asave = function(aData, cb) {
  let saveData;

  if (aData.title) {
    saveData = catModel({
      title: aData.title,
      image: aData.image,
      categoryId: aData.categoryId
    });
    console.log("before SAVE :::")
    saveData.save().then(cb);
  }

}


module.exports = exportModel;
