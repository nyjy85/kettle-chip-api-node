'use strict';
var path = require('path');
var express = require('express');
var app = express();
var cheerio = require('cheerio');
var request = require('request');

const kettleChipSites = [
  'http://www.kettlebrand.com/product_locator/',
  'http://www.snyderslanceproductlocator.com/capecod/',
  'https://deepriversnacks.com/find-us/'
]

module.exports = function (db) {

    // Pass our express application pipeline into the configuration
    // function located at server/app/configure/index.js
    require('./configure')(app, db);

    // Routes that will be accessed via AJAX should be prepended with
    // /api so they are isolated from our GET /* wildcard.
    app.use('/api', require('./routes'));


    /*
     This middleware will catch any URLs resembling a file extension
     for example: .js, .html, .css
     This allows for proper 404s instead of the wildcard '/*' catching
     URLs that bypass express.static because the given file does not exist.
     */
    app.use(function (req, res, next) {

        if (path.extname(req.path).length > 0) {
            res.status(404).end();
        } else {
            next(null);
        }

    });

    app.get('/*', function (req, res) {
        // scrape dem datasss
        request(kettleChipSites[0], function(err, response, body){
          var $ = cheerio.load(body);
          var input = $('.field-container')[0]
          input.getElementsByTagName('input')[0].value = '10920';
          var form = $('#item_finder_form')
          var button = form.getElementsByTagName('input').length
          form.getElementsByTagName('input')[button-1].click(function(){
            console.log('clicccked')
          })
        })
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ siteName: 'Kettle Chip Bitch' }, null, 3));
        // res.sendFile(app.get('indexHTMLPath'));
    });

    // Error catching endware.
    app.use(function (err, req, res, next) {
        console.error(err);
        console.error(err.stack);
        res.status(err.status || 500).send(err.message || 'Internal server error.');
    });

    return app;

};

