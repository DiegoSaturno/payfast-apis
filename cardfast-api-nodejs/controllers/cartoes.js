module.exports = function(app) {
    app.post("/cartoes/autorizar", function(request, response) {
        console.log("Processando pagamento com cartão.");

        var cartao = request.body;

        request.assert("numero", "O número do cartão é obrigatório.").len(16, 16);
        request.assert("bandeira", "A bandeira é obrigatória");
        request.assert("ano_de_expiracao", "O ano de expiração é obrigatório e deve ter 2 caracteres.").len(4, 4);
        request.assert("mes_de_expiracao", "O mes de expiração é obrigatório e deve ter 2 caracteres.").len(2, 2);
        request.assert("cvv", "O cvv é obrigatório.").len(3, 3);

        var errors = request.validationErrors();

        if (!errors) {
            
            cartao.status = "Autorizado";
            var authorizedResponse = {
                dados_do_cartao : cartao
            };
            response.status(201).send(authorizedResponse);
        } else {
            response.status(400).send(errors);
        }
    });
}
