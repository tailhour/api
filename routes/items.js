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
  console.log("-------- ITEM FORM ADD")
  catModel.get().then(cats => {
    res.render('add', {
      categories: cats
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

//itemId optional - append 
// birds || cats || dogs main category HERE !!!

// router.get('/:itemId?', (req, res) => {
router.get('/:itemId/:pageId?', (req, res) => {
  let itemId = req.params.itemId
  let catId = cfg.locals.CATS.indexOf(itemId)

  if (catId === -1) {
    model.getOne(itemId).then(item => {
      res.render('item', {
        item: item,
        category: cfg.locals.CATS[item.category]
      })
    })
  } else if (catId !== -1) {
    let pageId = req.params.pageId || 1
    model.getCategory({ category: catId, page: pageId }, items => {
      res.render('category', {
        items: items.data,
        category: itemId,
        pages: items.pages
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
