const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
const Schema = mongoose.Schema

const Promise = require('bluebird')

const cfg = require('../config.json')

const exportModel = {};

var itemSchema = new Schema({
  title: String,
  href: String,
  image: String,
  text: String,
  category: { type: Number, default: 0 },
  created: { type: Date, default: Date.now }
}, { versionKey: false })

itemSchema.pre('save', function(next) {
  if (!this.href) {
    this.href = this.title.substr(0, 25).trim().replace(/[^a-zA-Z0-9]+/g, "-")
    this.href = this.href.toLowerCase()
  }

  next();
});

let itemModel = mongoose.model('item', itemSchema)

exportModel.name = "item"

//extend with pagging
exportModel.getAll = function(cb) {
  itemModel.find().then(cb)
}

/*
return new Promise(function(resolve, reject) {
    itemModel.find({ category: 2 }).select(_.fields).limit(5).then(function(dogsData) {
      data.dogs = dogsData
      resolve(data)
    })
  })
  */



exportModel.getOne = function(itemId, cb) {
  return new Promise(function(resolve, reject) {
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      resolve({})
    } else {
      itemModel.findById(itemId).limit(1).then(itemData => {
        resolve(itemData)
      })
    }
  })
}

exportModel.getList = function(cb) {
  //https://stackoverflow.com/questions/34811299/mongo-find-limit-each-match
  itemModel.find({ category: { $in: [0, 1, 2] } }).sort({ category: 1 }).limit(30).then(listData => {
    let _listData = {
      birds: [],
      cats: [],
      dogs: []
    }
    let _cat

    for (var k in listData) {
      _cat = cfg.app.cats[listData[k].category]
      _listData[_cat].push(listData[k])
    }

    cb(_listData)
  })
}

// return [1, {active: 2}, 3, 4]
exportModel.createPage = function(length, active) {
  let i = 1
  let arr = []
  if (length <= 1) {
    return []
  }

  for (i; i <= length; i ++) {
    arr.push(((i === active) ? {active: i}: i))
  }
  return arr
}

//extend with pagging
//TODO fix pagging
exportModel.getCategory = function(catData, cb) {
  let categoryId = catData.category
  let page = catData.page - 1;
  // find all and slice after that ...
  itemModel.find({ category: categoryId }).then(catData => {
    let _totalPages, _catData = {
      data: [],
      total: ""
    }

    _catData.data = catData.slice((cfg.app.perPage * page), (cfg.app.perPage * (page + 1)))
    for (var k in _catData.data) {
      _catData.data[k].text = _catData.data[k].text.substr(0, 300)
    }

    _totalPages = Math.ceil(catData.length / cfg.app.perPage)
    _catData.total = catData.length
    _catData.pages = exportModel.createPage(_totalPages, (page + 1))
    cb(_catData)
  })
}

exportModel.getFields = function(fields, cb) {
  let fl = ''
  fl = (fields instanceof Array) ? fields.join(' ') : fields;

  itemModel.find().select(fl).then(cb)
}

exportModel.asave = function(aData, cb) {
  let saveData;

  if (aData.title && aData.text) {
    saveData = itemModel({
      title: aData.title,
      image: aData.image,
      text: aData.text,
      category: aData.category
    });

    saveData.save().then(cb);
  }

}



////////////////////////////////////////////////////
let _ = {}
_.fields = "title category image"
_.birds = function() {
  return new Promise(function(resolve, reject) {
    itemModel.find({ category: 0 }).select(_.fields).limit(5).then(function(birdsData) {
      resolve({ birds: birdsData })
    })
  })
}

_.cats = function(data) {
  return new Promise(function(resolve, reject) {
    itemModel.find({ category: 1 }).select(_.fields).limit(5).then(function(catsData) {
      data.cats = catsData
      resolve(data)
    })
  })
}

_.dogs = function(data) {
  return new Promise(function(resolve, reject) {
    itemModel.find({ category: 2 }).select(_.fields).limit(5).then(function(dogsData) {
      data.dogs = dogsData
      resolve(data)
    })
  })
}



//deprecate get with 3 queries with promise GOOD :)
// RETURN birds, cats, dogs
exportModel.getListOld = function(cb) {
  _.birds().then(_.cats).then(_.dogs).then(function(data) {
    cb(data)
  })
}

//////////////////////////////////////////////////



module.exports = exportModel;
