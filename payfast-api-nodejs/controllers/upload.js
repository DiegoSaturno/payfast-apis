var fs = require('fs');

module.exports = function(app) {
    app.post('/upload/imagem', function(request, response) {

        var imgName = request.headers.filename;

        request.pipe(fs.createWriteStream("files/uploaded/" + imgName))
        .on('finish', function(){
            console.log("Upload concluido com sucesso.");
            response.status(201).send("Upload concluído.");
        });
    });
}
