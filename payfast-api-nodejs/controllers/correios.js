module.exports = function(app) {
    app.post('/correios/calculoPrazo', function(request, response) {
        var dadosEntrega = request.body;

        var correiosClient = new app.servicos.correiosSoapClient();

        correiosClient.calcularPrazo(dadosEntrega, function(error, resultado) {
            if(!error) {
                console.log("Sucesso!");
                response.send(resultado);
            } else {
                response.status(500).send(erro);
            }
        });
    });
}
