var debug = require('debug')('elasticmanager.js')
const {
    Client: Client6
} = require('@elastic/elasticsearch')

const es_gphotos_index = {
    "mappings": {
        "google_drive": {
            "properties": {
                "id": {
                    "type": "keyword"
                },
                "name": {
                    "type": "keyword"
                },
                "mimeType": {
                    "type": "keyword"
                },
                "parents": {
                    "type": "keyword"
                },
                "createdTime": {
                    "type": "date"
                },
                "modifiedTime": {
                    "type": "date"
                },
                "originalFilename": {
                    "type": "keyword"
                },
                "fullFileExtension": {
                    "type": "keyword"
                },
                "fileExtension": {
                    "type": "keyword"
                },
                "md5Checksum": {
                    "type":"keyword"
                    },
                "size": {
                    "type":"long"
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
                            "type": "keyword"
                        },
                        "cameraMake": {
                            "type": "keyword"
                        },
                        "cameraModel": {
                            "type": "keyword"
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
                            "type": "keyword"
                        },
                        "sensor": {
                            "type": "keyword"
                        },
                        "exposureMode": {
                            "type": "keyword"
                        },
                        "colorSpace": {
                            "type": "keyword"
                        },
                        "whiteBalance": {
                            "type": "keyword"
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
                            "type": "keyword"
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
    }
}



const es_gdrive_index = {
    "mappings": {
        "google_drive": {
            "properties": {
                "id": {
                    "type": "keyword"
                },
                "name": {
                    "type": "keyword"
                },
                "mimeType": {
                    "type": "keyword"
                },
                "parents": {
                    "type": "keyword"
                },
                "createdTime": {
                    "type": "date"
                },
                "modifiedTime": {
                    "type": "date"
                },
                "originalFilename": {
                    "type": "keyword"
                },
                "fullFileExtension": {
                    "type": "keyword"
                },
                "fileExtension": {
                    "type": "keyword"
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
                            "type": "keyword"
                        },
                        "cameraMake": {
                            "type": "keyword"
                        },
                        "cameraModel": {
                            "type": "keyword"
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
                            "type": "keyword"
                        },
                        "sensor": {
                            "type": "keyword"
                        },
                        "exposureMode": {
                            "type": "keyword"
                        },
                        "colorSpace": {
                            "type": "keyword"
                        },
                        "whiteBalance": {
                            "type": "keyword"
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
                            "type": "keyword"
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
    }
}


class ElasticManager {

    constructor() {
        this.client = new Client6({
            node: 'http://localhost:9200',
            maxRetries: 5,
            requestTimeout: 60000,
            sniffOnStart: true
        })
    }

    initIndex(idx_name, idx_body) {
        return new Promise((res,rej) => {
            this.client.indices.exists({
                index: [idx_name]
            }).then((exists) => {
                if (exists.statusCode == 404) {
                    this.client.indices.create({
                        index: idx_name,
                        body: idx_body
                    }).then((response) => {res();}).catch((err) => {
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
            this.initIndex('google_photos', es_gphotos_index).then( () =>{
              this.initIndex('google_drive', es_gdrive_index).then( () => {
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
                    _type: type,
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
                            rej('bulk errors')
                        } else {
                            res();
                        }
                    }).catch((err) => {
                        rej(err);
                    });
                });
            }
}
        


 module.exports = ElasticManager;