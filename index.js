#!/usr/bin/env node

'use strict';

const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const hbs = require('express-handlebars');
const cfg = require('./config.json')
let fs = require("fs")

global.dev = (!process.env.NODE_ENV)


const cfgHbs = cfg.handlebars;
cfgHbs.layoutsDir = __dirname + "/views/layouts/"
cfgHbs.helpers = {
  section: function(name, options) {
    if (!this._sections) this._sections = {};
    this._sections[name] = options.fn(this);
    return null;
  }
}
app.engine('hbs', hbs(cfgHbs));
app.set('view engine', 'hbs');
if (global.dev) {
  app.set('view cache', false);
}

//static content should be served by nginx not by node !!!
//- EXPRESS setup
app.use(express.static('static'))
// app.use('/include', express.static('static'))
app.disable('x-powered-by')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.locals.ROOT = "//example.local/"
app.locals.CATS = cfg.app.cats

app.use("/", require('./routes'));

app.listen(cfg.port, (err) => {
  console.log(`.:: APP start on port: ${cfg.port}`)
})
