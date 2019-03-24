var memcached = require('memcached');

function createMemcachedClient() {
    var clientMemcached = new memcached('localhost:11211', {
        retries: 10,
        retry: 10000,
        remove: true
    }); //instancia o memcached que está rodando na porta localhost

    return clientMemcached;
}

module.exports = function() {
    return createMemcachedClient;
}
