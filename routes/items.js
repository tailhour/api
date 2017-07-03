let express = require('express')
let router = express.Router()
const cfg = require('../config.json')
let multer = require('multer');
let multipart = multer();

let models = require('../models')
const model = models.item
const catModel = models.category

//for xhr post requests 
router.all('*', (req, res, next) => {
  if (req.method != 'GET') {
    res.setHeader('Content-type', 'application/json');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*.ampproject.org');
    res.setHeader('AMP-Access-Control-Allow-Source-Origin', 'http://' + req.headers.host);
    res.setHeader('Access-Control-Expose-Headers', 'AMP-Access-Control-Allow-Source-Origin');
  }
  next()
})

//All categories
router.get('', (req, res) => {
  model.getList(itemsData => {
    res.render('list', {
      items: itemsData,
      categories: cfg.locals.CATS
    })
  })
})

router.get('/add', (req, res) => {
  catModel.get().then(cats => {
    res.render('add', {
      categories: cats
    })
  })
})

// Create field text index !!!
// db.items.createIndex({"title": "text"})
//------------
// find category from referrer 
// search for this category ...
router.get('/search', (req, res) => {
  let searchTerm = req.query.term.trim()
  let ref = req.headers.referrer || req.headers.referer
  if (ref) {
    ref = ref.split("/")
    ref = ref[(ref.length -1)]
  }
  //db.items.createIndex({"title": "text"})
  // model.search({term: searchTerm, referer: ref}).then(itemsData => {
  model.search({term: searchTerm, referer: ref}, itemsData => {
    if (itemsData.data.length === 0) {
      return res.render('category', {
        items: []
      })
    }
    let categoryColor = getColor(itemsData.categoryId)
    console.log(itemsData)
      res.render('category', {
        items: itemsData.data,
        category: itemsData.category,
        ccolor: categoryColor
      })

  })
})

/////////////////// TEMPORARY
router.get('/category/:catId?', (req, res) => {
  let catId = req.params.catId

  if (catId) {
    catModel.inc(catId, cats => {
      res.json(cats);
      // res.render('add', {})
    })
  } else {
    catModel.get(cats => {
      res.json(cats);
      // res.render('add', {})
    })
  }
})

function getColor(categoryId) {
  let catKey = cfg.locals.CATS[categoryId]
  return cfg.app.colors[categoryId][catKey] || cfg.app.color
}

//itemId optional - append 
// birds || cats || dogs main category HERE !!!

// router.get('/:itemId?', (req, res) => {
router.get('/:itemId/:pageId?', (req, res) => {
  let itemId = req.params.itemId
  let catId = cfg.locals.CATS.indexOf(itemId)

  if (catId === -1) {
    model.getOne(itemId).then(item => {
      let catKey = cfg.locals.CATS[item.category]

      let categoryColor = cfg.app.colors[item.category][catKey] || cfg.app.color
      res.render('item', {
        item: item,
        category: cfg.locals.CATS[item.category],
        ccolor: categoryColor
      })
    })
  } else if (catId !== -1) {
    let pageId = req.params.pageId || 1
    let categoryColor = cfg.app.colors[catId][itemId] || cfg.app.color
    model.getCategory({ category: catId, page: pageId }, items => {
      res.render('category', {
        items: items.data,
        category: itemId,
        pages: items.pages,
        ccolor: categoryColor
      })
    })
  }
})

router.post('/cats', (req, res) => {
  catModel.asave(req.body, cats => {
    console.log("cb :::", cats)
    res.json({ save: "ok" });
    // res.render('add', {})
  })
})

//increment with promise and save items after that 
// to do first insert and after that increment .... if successful 
router.post('/add', multipart.fields([]), function(req, res) {
  const categoryId = req.body.category
  catModel.inc(categoryId).then(incData => {
    model.asave(req.body, (articleData) => {
      res.json({ "result": "ok" })
    })
  })
})





module.exports = router;
