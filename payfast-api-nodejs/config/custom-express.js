//Carrega as libs
var express = require("express");
var consign = require('consign');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var morgan = require('morgan');
var logger = require('../servicos/logger.js');

module.exports = function() {
    var app = express();

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json()); //Ensina ao express utilizar o bodyParser
    app.use(expressValidator());

    app.use(morgan("common", {
        stream: {
            write: function(message) {
                logger.info(message);
            }
        }
    }));

    consign()
        .include('controllers') //incluindo a pasta controllers no app.
        .then('db') //incluindo a pasta db no app
        .then('servicos')
        .then('utility')
        .into(app);

    return app;
}
