const GoogleApiManager = require('./googleapimanager.js');
const ElasticManager = require('./elasticmanager.js');

var esdb    = new ElasticManager();

esdb.init().then( ()=> {
    var gdrive = new GoogleApiManager(esdb);
    gdrive.init().then(() => {
        gdrive.downloadDriveMeta();
    })
    

}).catch((err) => {console.error(err)});
