const GoogleApiManager = require('./googleapimanager.js');
const ElasticManager = require('./elasticmanager.js');
const util = require('util');

var esdb = new ElasticManager();
var _ = require('underscore');
var lpad = require('underscore.string/lpad');
var sleep = require('sleep');


var search_not_folders_param = {
    index: 'google_drive',
    scroll: '30s',
    body: {
        "query": {
            "bool": {
                "must_not": [{
                    "match": {
                        "mimeType": "application/vnd.google-apps.folder"
                    }
                }]
            }
        }
    }
}


var search_folders_param = {
    index: 'google_drive',
    scroll: '30s',
    body: {
        "sort": [{
            "name": "desc"
        }],
        "query": {
            "bool": {
                "must": [{
                        "regexp": {
                            "name": "2[0-9].*"
                        }
                    },
                    {
                        "match": {
                            "mimeType": "application/vnd.google-apps.folder"
                        }
                    }
                ]
            }
        }
    }
}

class search_google_photo_param {
    constructor() {
        this.q = {
            index: 'google_photos',
            scroll: '5s',
            body: {
                "query": {
                    "bool": {

                        "must": [{
                                "match": {
                                    "filename.keyword": ""
                                }
                            },
                            {
                                "match": {
                                    "mimeType.keyword": "image/jpeg"
                                }
                            }
                        ],
                        "filter": [{
                            "range": {
                                "mediaMetadata.creationTime": {
                                    "gte": "1900/04/29",
                                    "lte": "2020/04/29",
                                    "format": "yyyy/MM/dd"
                                }
                            }
                        }]
                    }
                }
            }
        }
    }
}


var all_folders = [];

function populateMustClause(item) {
    var ret = [];

    ret = [{
            "match": {
                "filename.keyword": item.originalFilename
            }
        }
        /*,
                {"match": {"mimeType": "image/jpeg"}}*/
    ];

    if (item.imageMediaMetadata == undefined)
        return ret;


    if (item.imageMediaMetadata.width != undefined)
        ret.push({
            "match": {
                "mediaMetadata.width": item.imageMediaMetadata.width
            }
        });

    if (item.imageMediaMetadata.height != undefined)
        ret.push({
            "match": {
                "mediaMetadata.height": item.imageMediaMetadata.height
            }
        });

    if (item.imageMediaMetadata.cameraMake != undefined)
        ret.push({
            "match": {
                "mediaMetadata.photo.cameraMake.keyword": item.imageMediaMetadata.cameraMake
            }
        });

    if (item.imageMediaMetadata.cameraModel != undefined)
        ret.push({
            "match": {
                "mediaMetadata.photo.cameraModel.keyword": item.imageMediaMetadata.cameraModel
            }
        });

    if (item.imageMediaMetadata.focalLength != undefined)
        ret.push({
            "match": {
                "mediaMetadata.photo.focalLength": Math.trunc(item.imageMediaMetadata.focalLength)
            }
        });

    if (item.imageMediaMetadata.apertureFNumber != undefined)
        ret.push({
            "match": {
                "mediaMetadata.photo.apertureFNumber": Math.trunc(item.imageMediaMetadata.apertureFNumber)
            }
        });

    if (item.imageMediaMetadata.aperture != undefined)
        ret.push({
            "match": {
                "mediaMetadata.photo.apertureFNumber": Math.trunc(item.imageMediaMetadata.aperture)
            }
        });


    if (item.imageMediaMetadata.isoSpeed != undefined)
        ret.push({
            "match": {
                "mediaMetadata.photo.isoEquivalent": item.imageMediaMetadata.isoSpeed
            }
        });

    return ret;
}

function drive2photo(esclient, item) {

    return new Promise((res, rej) => {

        var q = (new search_google_photo_param()).q;

        q.body.query.bool.must[0].match["filename.keyword"] = item.originalFilename;
        //q.body.query.bool.must[1].match.mimeType = folder.childs[1].mimeType;

        //lets match by filename first
        esclient.search(q).then((response1) => {
            if (response1.length == 1) {
                //happy scenario
                res(response1);
            } else {
                //lets match on mediaMetadata.creationTime  
                var q = (new search_google_photo_param()).q;
                q.body.query.bool.must[0].match["filename.keyword"] = item.originalFilename;

                if (item.imageMediaMetadata && item.imageMediaMetadata.time) {
                    var d = new Date(Date.parse((item.imageMediaMetadata.time).replace(/:/g, "/").split(' ').slice(0, -1).join(' ')));
                    q.body.query.bool.filter[0].range["mediaMetadata.creationTime"].gte = d.getFullYear() + "/" + lpad((d.getMonth() + 1), 2, '0') + "/" + lpad(d.getDate(), 2, '0');
                    q.body.query.bool.filter[0].range["mediaMetadata.creationTime"].lte = d.getFullYear() + "/" + lpad((d.getMonth() + 1), 2, '0') + "/" + lpad(d.getDate(), 2, '0');
                } else {
                    q.body.query.bool.must = populateMustClause(item);
                }

                esclient.search(q).then((response2) => {
                    if (response2.length == 1) {
                        //happy
                        res(response2)
                    } else {
                        //lets try again
                        var q = (new search_google_photo_param()).q;
                        q.body.query.bool.must[0].match["filename.keyword"] = item.originalFilename;
                        q.body.query.bool.must = populateMustClause(item);
                        //sleep.sleep(3);
                        esclient.search(q).then((response3) => {
                            if (response3.length == 1) {
                                //happy
                                res(response3)
                            } else {
                                if (item.mimeType.match(/image.*\//g) != null) {
                                    if (response3.length == 0) {
                                        console.log(JSON.stringify(q.body));
                                    } else {
                                        console.log('warning:', item.originalFilename, ' has ', response3.length, ' matches');
                                        //sleep.sleep(3);
                                        res(response3);
                                    }
                                } else {
                                    res([{
                                        id: undefined
                                    }]);
                                }
                            }
                        });
                    }
                }).catch((err) => {
                    console.log(q);
                    console.log(item.originalFilename);
                    console.error(err);
                    rej(err);
                });
            }
        });

    });
}



function d2p(esclient, name, folder) {
    return new Promise((d2pres, d2prej) => {
        var album = {};
        album[name] = [];
        if (folder.childs == undefined) {
            d2pres(album);
            return;
        }


        folder.childs = _.unique(folder.childs);

        [...Array(folder.childs.length)].reduce(

            (p, fn, i) =>
            p.then(fn => new Promise(resolve => {

                drive2photo(esclient, folder.childs[i]).then((mediaItem) => {
                    if (i == folder.childs.length - 1) {
                        album[name] = _.uniq(album[name]);
                        //console.log('[album]', album);
                        sleep.sleep(10);
                        d2pres(album);
                    } else {
                        if (mediaItem instanceof Array) {
                            mediaItem.map((i) => {
                                if (i.id != undefined)
                                    album[name].push(i.id);
                            });
                        } else {
                            if (mediaItem.id != undefined)
                                album[name].push(mediaItem.id);
                        }
                        //console.log('*:', folder.childs[i].originalFilename);
                        resolve(); //carry on
                    }
                }).catch((err) => {
                    console.error('fatal error here:' + err);
                    d2prej(err);
                });

            })), Promise.resolve()
        );
    });
}



var albums = {};

var all_folders = {};
esdb.init().then(() => {
    esdb.search(search_folders_param).then((folders) => {
        all_folders = folders;
        //console.log(all_folders);
    }).then(function () {
        //search all media items
        esdb.search(search_not_folders_param).then((files) => {
            all_files = files;
            for (var i in files) {
                //take the parent
                if (files[i].parents == undefined)
                    continue;

                var parent = files[i].parents[0];
                //find the parent name

                var parent_obj = undefined;
                for (var p in all_folders) {
                    if (all_folders[p].id == parent) {
                        parent_obj = all_folders[p];
                        break;
                    }
                }

                if (!parent_obj)
                    continue;

                if (parent_obj != undefined && parent_obj.childs == undefined)
                    parent_obj['childs'] = [];

                parent_obj['childs'].push(files[i]);
            }
        }).then(() => {

            var gphotos = new GoogleApiManager(esdb);
            gphotos.init().then(() => {

                [...Array(Object.keys(all_folders).length)].reduce((p, fn, i) =>
                    p.then(
                        fn => new Promise(r => {
                            d2p(esdb, all_folders[i].name, all_folders[i]).then((album) => {
                                gphotos.createAlbum(all_folders[i].name).then ( (galbum) => {
                                    var album_id = galbum.id;
                                    var ids = album[all_folders[i].name];
                                    ids.length = 1;
                                    console.log('adding to album ', all_folders[i].name, "#id=", album_id, "#ids=", ids);
                                    gphotos.addMediaItems(album_id, ids).then( () => {
                                        process.exit(0);
                                        r();        
                                    })

                                })
                            });
                        })
                    ), Promise.resolve());
            })
        })
    })

})