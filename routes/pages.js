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


router.get('/:pageId?', (req, res) => {
  const pageId = req.params.pageId
  if (pageId === "contact") {

  } else if (pageId === "ads") {

  } else {
    res.render('pages/default', { 
      content: "Not static PAGE : " + pageId 
    })
  }
})

module.exports = router