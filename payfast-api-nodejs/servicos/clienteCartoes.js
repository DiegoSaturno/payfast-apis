var restify = require('restify-clients');

function cartoesClient() {
    this._client = restify.createJsonClient({
        url: 'http://localhost:3001'
    });
}

cartoesClient.prototype.autorizar = function(cartao, callback) {
    this._client.post("/cartoes/autorizar", cartao, callback);
};

module.exports = function() {
    return cartoesClient;
}
