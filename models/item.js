const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
const Schema = mongoose.Schema

const Promise = require('bluebird')

const cfg = require('../config.json')

const exportModel = {};

var itemSchema = new Schema({
  title: String,
  href: String,
  text: {
    intro: String,
    part1: String,
    part2: String,
    end: String
  },
  media: {
    intro: String,
    video: String,
    gallery: Schema.Types.Mixed
  },
  category: { type: Number, default: 0 },
  created: { type: Date, default: Date.now }
}, { versionKey: false })

itemSchema.index({ title: 'text', text: 'text' });

itemSchema.pre('save', function(next) {
  if (!this.href) {
    this.href = this.title.substr(0, 30).trim().replace(/[^a-zA-Z0-9]+/g, "-")
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
    for (var k in listData) {
      let _cat = cfg.locals.CATS[listData[k].category]
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

  for (i; i <= length; i++) {
    arr.push(((i === active) ? { active: i } : i))
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
      _catData.data[k].text.intro = _catData.data[k].text.intro.substr(0, 300)
    }

    _totalPages = Math.ceil(catData.length / cfg.app.perPage)
    _catData.total = catData.length
    _catData.pages = exportModel.createPage(_totalPages, (page + 1))
    cb(_catData)
  })
}

// bug if have several results and for first one get category ID and others are broken ....
function searchFunc(sData, cb) {
  let query = {
    $text: {
      $search: sData.term
    }
  }

  if (sData.categoryId || sData.categoryId === 0) {
    query.category = sData.categoryId
  }

  itemModel.find(query).then(itemsData => {
    if (!sData.categoryId && itemsData.length > 0) {
      sData.categoryId = itemsData[0].category
      sData.category = cfg.locals.CATS[sData.categoryId]
    }

    sData.data = itemsData || []
    cb(sData)
  })
}

//return Promise
// todo refactor THIS no more than 2 callbacks ....
// 1. get category ID from referal
// 2. search in category ID 
exportModel.search = function(searchData, cb) {
  let result = {
      referer: searchData.referer,
      term: searchData.term,
      // category: 'cats',
      // categoryId: 1,
      data: []
    }
    // search from single item
  if (mongoose.Types.ObjectId.isValid(result.referer)) {
    itemModel.findById(result.referer).limit(1).then(itemData => {
      result.category = cfg.locals.CATS[itemData.category]
      result.categoryId = itemData.category

      searchFunc(result, cb)
    })
  } else if (cfg.locals.CATS.indexOf(result.referer) !== -1) {
    result.category = result.referer
    result.categoryId = cfg.locals.CATS.indexOf(result.referer)

    searchFunc(result, cb)
  } else {
    searchFunc(result, cb)
  }
}

exportModel.getFields = function(fields, cb) {
  let fl = ''
  fl = (fields instanceof Array) ? fields.join(' ') : fields;

  itemModel.find().select(fl).then(cb)
}

exportModel.asave = function(aData, cb) {
  let saveData = {}

  if (aData.title && aData.text) {
    //clear text from not required fields
    (!aData.text.part1) && (delete aData.text.part1);
    (!aData.text.part2) && (delete aData.text.part2);
    
    (!aData.media.video) && (delete aData.media.video);

    if (!aData.media.gallery) {
      delete aData.media.gallery;
    } else {
      aData.media.gallery = aData.media.gallery.split(";")
      aData.media.gallery = aData.media.gallery.map(val => val.trim())
    }

    saveData = {
      title: aData.title,
      text: aData.text,
      media: aData.media,
      category: aData.category
    };

    console.log(saveData)

    itemModel(saveData).save().then(cb);
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
