var debug = require('debug')('elasticmanager.js')
const {
    Client: Client7
} = require('@elastic/elasticsearch')

const es_gphotos_index = {
    "mappings": {
        //"google_photos": {
        "properties": {
            "mediaItem": {
                "properties": {
                    "id": {
                        "type": "text"
                    },
                    "productUrl": {
                        "type": "text"
                    },
                    "baseUrl": {
                        "type": "text"
                    },
                    "mimeType": {
                        "type": "keyword",
                        "index":"true"
                    },
                    "contributorInfo": {
                        "properties": {
                            "profilePictureBaseUrl": {
                                "type": "text"
                            },
                            "displayName": {
                                "type": "text"
                            }
                        }
                    },
                    "description": {
                        "type": "text"
                    },
                    "mediaMetadata": {
                        "properties": {
                            "creationTime": {
                                "type": "date"
                            },
                            "width": {
                                "type": "integer"
                            },
                            "height": {
                                "type": "integer"
                            },
                            "photo": {
                                "properties": {
                                    "cameraMake": {
                                        "type": "keyword",
                                        "index": "true"
                                    },
                                    "cameraModel": {
                                        "type": "keyword",
                                        "index": "true"
                                    },
                                    "focalLength": {
                                        "type": "float"
                                    },
                                    "apertureFNumber": {
                                        "type": "float"
                                    },
                                    "isoEquivalent": {
                                        "type": "integer"
                                    },
                                    "exposureTime": {
                                        "type": "float"
                                    }
                                }
                            },
                            "video": {
                                "properties": {
                                    "cameraMake": {
                                        "type": "text"
                                    },
                                    "cameraModel": {
                                        "type": "text"
                                    },
                                    "fps": {
                                        "type": "double"
                                    }
                                }
                            }
                        }
                    },
                    "filename": {
                        "type": "keyword",
                        "index": "true"
                    }
                }
            }
        }
    }
    //}
}



const es_gdrive_index = {
    "mappings": {
        //"google_drive": {
        "properties": {
            "id": {
                "type": "text"
            },
            "name": {
                "type": "keyword",
                "index":"true"
            },
            "mimeType": {
                "type": "keyword",
                "index":"true"
            },
            "parents": {
                "type": "text"
            },
            "createdTime": {
                "type": "date"
            },
            "modifiedTime": {
                "type": "date"
            },
            "originalFilename": {
                "type": "keyword",
                "index": "true"
            },
            "fullFileExtension": {
                "type": "text"
            },
            "fileExtension": {
                "type": "text"
            },
            "imageMediaMetadata": {
                "properties": {
                    "width": {
                        "type": "integer"
                    },
                    "height": {
                        "type": "integer"
                    },
                    "rotation": {
                        "type": "integer"
                    },
                    "location": {
                        "properties": {
                            "latitude": {
                                "type": "double"
                            },
                            "longitude": {
                                "type": "double"
                            },
                            "altitude": {
                                "type": "double"
                            }
                        }
                    },
                    "time": {
                        "type": "text"
                    },
                    "cameraMake": {
                        "type": "text"
                    },
                    "cameraModel": {
                        "type": "keyword",
                        "index": "true"
                    },
                    "exposureTime": {
                        "type": "float"
                    },
                    "aperture": {
                        "type": "float"
                    },
                    "flashUsed": {
                        "type": "boolean"
                    },
                    "focalLength": {
                        "type": "float"
                    },
                    "isoSpeed": {
                        "type": "integer"
                    },
                    "meteringMode": {
                        "type": "text"
                    },
                    "sensor": {
                        "type": "text"
                    },
                    "exposureMode": {
                        "type": "text"
                    },
                    "colorSpace": {
                        "type": "text"
                    },
                    "whiteBalance": {
                        "type": "text"
                    },
                    "exposureBias": {
                        "type": "float"
                    },
                    "maxApertureValue": {
                        "type": "float"
                    },
                    "subjectDistance": {
                        "type": "integer"
                    },
                    "lens": {
                        "type": "text"
                    }
                }
            },
            "videoMediaMetadata": {
                "properties": {
                    "width": {
                        "type": "integer"
                    },
                    "height": {
                        "type": "integer"
                    },
                    "durationMillis": {
                        "type": "integer"
                    }
                }
            }
        }
    }
    //}
}


class ElasticManager {

    constructor() {
        this.client = new Client7({
            node: 'http://localhost:9200',
            maxRetries: 5,
            requestTimeout: 60000,
            sniffOnStart: true
        })
    }

    initIndex(idx_name, idx_body) {
        return new Promise((res, rej) => {
            this.client.indices.exists({
                index: [idx_name]
            }).then((exists) => {
                if (exists.statusCode == 404) {
                    this.client.indices.create({
                        index: idx_name,
                        body: idx_body
                    }).then((response) => {
                        res();
                    }).catch((err) => {
                        console.error(err);
                        rej(err);
                    });
                } else {
                    if (exists.statusCode == 200) {
                        res();
                    }
                }
            });
        })
    }

    init() {
        return new Promise((res, rej) => {
            this.initIndex('google_photos', es_gphotos_index).then(() => {
                this.initIndex('google_drive', es_gdrive_index).then(() => {
                    res();
                })
            }).catch((err) => {
                rej(err)
            });
        });
    }

    addBulkItems(mediaItems, type) {
        var array = [];
        for (var i in mediaItems) {
            var bulk_l1 = {};
            bulk_l1.index = {
                _index: type,
                _id: mediaItems[i].id
            }
            array.push(bulk_l1);
            array.push(mediaItems[i])
        }
        return new Promise((res, rej) => {
            this.client.bulk({
                refresh: true,
                body: array
            }).then((bulkResponse) => {
                if (bulkResponse.errors) {
                    console.log(bulkResponse.errors)
                    rej('bulk errors')
                } else {
                    res();
                }
            }).catch((err) => {
                rej(err);
            });
        });
    }


    search(search_param) {
        return new Promise((resolve, reject) => {
            var hits = [];
            this.client.search(search_param).then((res) => {
                
                for (var hit in res.body.hits.hits) {
                    hits.push(res.body.hits.hits[hit]._source);
                }
                _scrollSearch(this.client, res.body._scroll_id, hits).then(() => {                    
                    resolve(hits);
                });
            }).catch((err) => {
                console.log('fatal error:' + err)
                process.exit(0);
            });
        })
    }
}


function _scrollSearch(client, scroll_id, hits) {
    return Promise.resolve().then(function resolver() {
        return new Promise((res, rej) => {
            client.scroll({
                'scrollId': scroll_id,
                scroll: '5s'
            }).then((data) => {
                if (data.body.hits.hits.length > 0) {
                    for (var hit in data.body.hits.hits) {
                        hits.push(data.body.hits.hits[hit]._source);
                    }
                    scroll_id = data.body._scroll_id;
                    res();
                } else {
                    rej('done');
                }
            }).catch((err) => {
                rej(err);
            });

        }).then(resolver).catch((error) => {});
    });
}



module.exports = ElasticManager;