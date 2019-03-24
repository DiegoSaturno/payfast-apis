var soap = require('soap');

function correiosClient() {
    this._url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx?wsdl';
}

correiosClient.prototype.calcularPrazo = function(dadosEntrega, callback) {
    soap.createClient(this._url, function(error, cliente){
        console.log('Cliente soap criado.');

        cliente.CalcPrazo(dadosEntrega, callback);
    });
};

module.exports = function() {
    return correiosClient;
}
