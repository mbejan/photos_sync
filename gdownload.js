const GPhotos = require('./gphotos.js');
const ElasticManager = require('./elasticmanager.js');



var esdb    = new ElasticManager();

esdb.init().then( ()=> {
    var gphotos = new GPhotos(esdb);
    gphotos.init().then(() => {
        gphotos.downloadMeta();
    })

}).catch((err) => {console.error(err)});
