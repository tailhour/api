const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
const Schema = mongoose.Schema

const Promise = require('bluebird')

const cfg = require('../config.json')

const exportModel = {};

var pageSchema = new Schema({
  title: String,
  href: String,
  image: String,
  text: String,
  formContact: Boolean,
  formAds: Boolean,
  created: { type: Date, default: Date.now }
}, { versionKey: false })

pageSchema.pre('save', function(next) {
  if (!this.href) {
    this.href = this.title.substr(0, 25).trim().replace(/[^a-zA-Z0-9]+/g, "-")
    this.href = this.href.toLowerCase()
  }

  next();
})


let pageModel = mongoose.model('page', pageSchema)

exportModel.name = "page"

exportModel.one = function(hrefValue) {
	return new Promise((resolve, reject) => {
		pageModel.find({href: hrefValue}).then(pageData => {
			if (pageData.length > 0) {
				resolve(pageData[0])
			} else {
				reject({empty: "Empty collection"})
			}
		}, pageError => {
			reject(pageError)
		})
	})
}


    module.exports = exportModel;
