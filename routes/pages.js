let express = require('express')
let router = express.Router()

const cfg = require('../config.json')

let multer = require('multer');
let multipart = multer();

let models = require('../models')
const model = models.page

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

router.error = function (res) {
  res.render('page', {
    content:{
      title: "OoOps something when wrong for this page : "
    }
  })
}

router.get('/:pageId?', (req, res) => {
  const pageId = req.params.pageId
  let isStatic = !!(cfg.app.static.indexOf(pageId) !== -1)

  if (!isStatic) {
    return router.error(res)
  }

  model.one(pageId).then(pageData => {
    res.render('page', {
      content: pageData,
      pageUrl: pageId
    })
  }, pageError => {
    router.error(res)
  })
})

router.post("ads", (req, res) => {

})

router.post("contact", multipart.fields([]), (req, res) => {
    res.json({result: "OK"})
})

module.exports = router
