var logger = require('../servicos/logger.js');

module.exports = function(app) {
    app.get("/pagamentos", function(request, response){
        response.send("OK.");
    });

    app.get("/pagamentos/pagamento/:id", function(request, response){
        var id = request.params.id;
        console.log("Consultando pagamento de ID " + id);
        logger.info("Consultando pagamento de ID " + id);

        var memcachedClient = app.servicos.memcachedClient();

        memcachedClient.get('pagamento-' + id, function(error, retorno){
            if (error || !retorno) {
                console.log("MISS - Chave não encontrada");
                logger.info("MISS - Chave " + id + " não encontrada em cache");

                var connection = app.db.connectionFactory();
                var pagamentoDAO = new app.db.PagamentoDAO(connection);

                pagamentoDAO.buscarPorId(id, function(error, resultado) {
                    if (!error) {
                        console.log(JSON.stringify(resultado));
                        response.json(resultado);
                    } else {
                        console.log("Erro ao consultar no banco " + error)
                        response.status(500).send(error);
                    }
                });
            } else {
                console.log("HIT - valor: " + JSON.stringify(retorno));
                logger.info("HIT - valor: " + JSON.stringify(retorno));
                response.status(500).send(retorno);
            }
        });
    });

    //Rota para criar pagamento
    app.post("/pagamentos/pagamento", function(request, response) {

        request.assert("pagamento.forma_de_pagamento", "A forma de pagamento é obrigatória.").notEmpty();
        request.assert("pagamento.valor", "O valor deve ser obrigatório.").notEmpty().isFloat();

        var erros = request.validationErrors();

        if (!erros) {
            var pagamento = request.body["pagamento"];

            console.log('Processando requisição de pagamento');

            pagamento.status = 'Criado';
            pagamento.data = new Date;

            var connection = app.db.connectionFactory();
            var pagamentoDAO = new app.db.PagamentoDAO(connection);

            pagamentoDAO.salvar(pagamento, function(erro, resultado){
                if (erro) {
                    response.status(500).send(erro);
                } else {
                    var pagamentoID = resultado.insertId;
                    pagamento.id = pagamentoID;

                    var memcachedClient = app.servicos.memcachedClient();

                    memcachedClient.set('pagamento-' + pagamentoID, pagamento, 60000, function(erroCache) {
                        if (!erroCache) {
                            console.log('Chave adicionada em cache: pagamento-' + pagamentoID);
                            logger.info('Chave adicionada em cache: pagamento-' + pagamentoID);
                        }
                    });

                    if (pagamento.forma_de_pagamento == "cartao") {
                        var cartao = request.body["cartao"];
                        console.log(cartao);

                        var clienteCartoes = new app.servicos.clienteCartoes();

                        clienteCartoes.autorizar(cartao, function(errorClient, reqClient, resClient, retorno) {
                            if (!errorClient) {
                                console.log("Consumindo serviço de cartões");
                                console.log(retorno);

                                response.location("/pagamentos/pagamento/" + pagamentoID);
                                var dataResponse = {
                                    dados_do_pagamento : pagamento,
                                    cartao : retorno.dados_do_cartao,
                                    links : [
                                        {
                                            href: 'http://localhost:3000/pagamentos/pagamento/' + pagamentoID,
                                            method: 'PUT',
                                            rel: 'Confirmar pagamento'
                                        },
                                        {
                                            href: 'http://localhost:3000/pagamentos/pagamento/' + pagamentoID,
                                            method: 'DELETE',
                                            rel: 'Cancelar pagamento'
                                        }
                                    ]
                                }
                                response.status(201).json(dataResponse);
                            } else {
                                console.log(errorClient);
                                response.status(400).send(errorClient);
                            }
                        });
                    } else {
                        response.location("/pagamentos/pagamento/" + pagamentoID);
                        var dataResponse = {
                            dados_do_pagamento : pagamento,
                            links : [
                                {
                                    href: 'http://localhost:3000/pagamentos/pagamento/' + pagamentoID,
                                    method: 'PUT',
                                    rel: 'Confirmar pagamento'
                                },
                                {
                                    href: 'http://localhost:3000/pagamentos/pagamento/' + pagamentoID,
                                    method: 'DELETE',
                                    rel: 'Cancelar pagamento'
                                }
                            ]
                        }

                        response.status(201).json(dataResponse);
                    }
                }
            });
        } else {
            response.status(400).send(erros);
        }
    });

    //Rota para confirmar pagamento
    app.put("/pagamentos/pagamento/:id", function(request, response) {
        var idPagamento = request.params.id;

        var connection = app.db.connectionFactory();
        var pagamentoDAO = new app.db.PagamentoDAO(connection);
        var pagamento = {};

        pagamento.id = idPagamento;
        pagamento.status = 'Confirmado';

        pagamentoDAO.atualizar(pagamento, function(erro){
            if (!erro) {
                response.send(pagamento);
            } else {
                response.status(500).send(erro);
            }
        });
    });

    //Rota para cancelar pagamento
    app.delete("/pagamentos/pagamento/:id", function(request, response) {
        var idPagamento = request.params.id;

        var connection = app.db.connectionFactory();
        var pagamentoDAO = new app.db.PagamentoDAO(connection);
        var pagamento = {};

        pagamento.id = idPagamento;
        pagamento.status = 'Cancelado';

        pagamentoDAO.atualizar(pagamento, function(erro){
            if (!erro) {
                response.status(204).send(pagamento);
            } else {
                response.status(500).send(erro);
            }
        });
    });
}
