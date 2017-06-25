var express = require('express')
var router = express.Router()

const cfg = require('../config.json')
let models = require('../models')

router.use('/items', require('./items'))
router.use('/pages', require('./pages'))
router.use('/api', require('./api'))

router.get('/', (req, res, next) => {

  models.item.getList(itemsData => {
    res.render('index', {
      items: itemsData,
      categories: cfg.app.cats
    })
  })
  // res.render('index', {
  //   message: "MEssage for template"
  // });
})

module.exports = router;