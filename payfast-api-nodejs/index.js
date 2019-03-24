var app = require('./config/custom-express')(); //carrega o arquivo e instanciou o objeto

app.listen(3000, function(){
    //console.log("Servidor rodando na porta 3000");
});
