let express = require('express')
let router = express.Router()
const allowed = ['title', 'text', 'created'];
let models = require('../models')

router.get('/', (req, res, next) => {
  res.json({
    'url': 'api'
  });
})

router.get('/items', (req, res) => {
  let fields = req.query.fields;
  // todo Extend with multi FIELDS(split by comma) ...
  // if (fields && allowed.indexOf(fields) !== -1) {
  if (fields) {
  	fields = (fields.indexOf(",") !== -1) ? fields.split(",") : fields
    models.item.getFields(fields, (data) => {
      res.json(data)
    })
  } else {
    models.item.getAll(items => res.json(items))
  }
})

router.get('/cats/:catId?', (req, res) => {
	let catId = req.params.catId;
	if (catId) {
		models.item.getCategory(catId, (catData) => {
			console.log("find CATS :::", catData)
			res.json(catData)
		})
	}
})

router.post('/items', (req, res) => {
  models.item.asave(req.body, (data, err) => {
    res.send(data)
  });
})

router.post('/images', function(req, res) {
  req.read(function() {
    console.log("+++", arguments.length);
  })

  req.on('error', function(err) {
    console.error(err.stack);
  });
})

// app.use('/api/images', (req, res) => {
//   var reqData = [];
//   req.on('data', function(data) {
//     reqData.push(data)
//   }).on('end', function() {
//     reqData = Buffer.concat(reqData);
//     fs.writeFile("./static/images/tmp/ban.jpg", reqData, "binary", function(error) {
//       console.log("written file");
//       res.json({})
//     });
//   });
// })

module.exports = router;
