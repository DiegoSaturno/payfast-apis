var cluster = require('cluster');
var os = require('os');

var cpus = os.cpus();

console.log("Executando thread");

if (cluster.isMaster) {
    console.log('executando thread master');
    cluster.fork();

    cpus.forEach(function(cpu) {
        cluster.fork();
    });

    cluster.on('listening', function(worker) {
        console.log("Subindo cluster " + worker.process.pid);
    });

    cluster.on('exit', worker => {
        console.log("Cluster %d deconectado", worker.process.pid);
        cluster.fork();
    });

} else {
    console.log('thread slave');
    require("./index.js");
}
