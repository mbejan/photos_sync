var GPhotos = require('./gphotos.js');
var GPhotosES = require('./gphotoses.js');


var gphotos = new GPhotos();

gphotos.init().then((r, rej) => {
    gphotos.downloadMeta();
    //gphotos.refreshToken();
    }).catch((err) => {})
;
