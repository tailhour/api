const tools = require('express').Router()
const cfg = require('../config.json')

let jsonData = require('./data.json');

let paginator  = function (page) {
  let startN
  var tmplData
  startN = page * cfg.app.perPage;
  tmplData = jsonData.slice(startN, (startN + cfg.app.perPage))

  return tmplData;
}

let totalPages = function () {
  let total
  total = jsonData.length / cfg.app.perPage
  total = Math.ceil(total)  + 1
  var totalArray = [];
  for (var i = 1; i < total; i ++) {
    totalArray.push(i);
  }

  return totalArray
}

tools.get('/', (req, res) => {
  res.render('list', {jData: paginator(0), total: totalPages()});
})

tools.get('/:toolId', (req, res) => {
  let page, toolId

  toolId = req.params.toolId

  if (toolId.indexOf("page") !== -1) {
    page = toolId.substr(4)
    page = parseInt(page) - 1
    res.render('list', {jData: paginator(page), total: totalPages(), current: (page + 1)})
  } else {
    tmplData = jsonData[req.params.toolId] || jsonData[0]
    res.render('article', tmplData);
  }
})

module.exports = tools;
