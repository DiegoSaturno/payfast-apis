var app = require('./config/custom-express')(); //carrega o arquivo e instanciou o objeto

app.listen(3001, function(){
    console.log("Cardfast rodando na porta 3001.");
});
