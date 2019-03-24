//Carrega as libs
var express = require("express");
var consign = require('consign');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

module.exports = function() {
    var app = express();

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json()); //Ensina ao express utilizar o bodyParser
    app.use(expressValidator());

    consign()
        .include('controllers') //incluindo a pasta controllers no app.
        .into(app);

    return app;
}
