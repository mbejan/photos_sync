const GoogleApiManager = require('./googleapimanager.js');
const ElasticManager = require('./elasticmanager.js');

var esdb    = new ElasticManager();

esdb.init().then( ()=> {
    var gphotos = new GoogleApiManager(esdb);
    gphotos.init().then(() => {
        gphotos.downloadPhotosMeta();
    })
    
}).catch((err) => {console.error(err)});
