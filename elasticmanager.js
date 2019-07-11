var debug = require('debug')('elasticmanager.js')
const {
    Client: Client6
} = require('@elastic/elasticsearch')

const es_media_index = {
    "mappings": {
        "google_photos": {
            "properties": {
                "mediaItem": {
                    "properties": {
                        "id": {
                            "type": "keyword"
                        },
                        "productUrl": {
                            "type": "keyword"
                        },
                        "baseUrl": {
                            "type": "keyword"
                        },
                        "mimeType": {
                            "type": "keyword"
                        },
                        "contributorInfo": {
                            "properties": {
                                "profilePictureBaseUrl": {
                                    "type": "keyword"
                                },
                                "displayName": {
                                    "type": "keyword"
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
                                    "type": "text"
                                },
                                "height": {
                                    "type": "text"
                                },
                                "photo": {
                                    "properties": {
                                        "cameraMake": {
                                            "type": "text"
                                        },
                                        "cameraModel": {
                                            "type": "text"
                                        },
                                        "focalLength": {
                                            "type": "text"
                                        },
                                        "apertureFNumber": {
                                            "type": "integer"
                                        },
                                        "isoEquivalent": {
                                            "type": "integer"
                                        },
                                        "exposureTime": {
                                            "type": "text"
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
                                            "type": "integer"
                                        }
                                    }
                                }
                            }
                        },
                        "filename": {
                            "type": "keyword"
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

    init() {
        return new Promise((res, rej) => {
            this.client.indices.exists({
                index: "media"
            }).then((exists) => {
                if (exists.statusCode == 404) {
                    this.client.indices.create({
                        index: "media",
                        body: es_media_index
                    }).then((response) => {
                        res('index media created');
                    }).catch((err) => {
                        console.error(err);
                        rej(err);
                    });
                } else {
                    if (exists.statusCode == 200) {
                        res();
                    } else {
                        rej('Some error on init()');
                    }
                }

            }).catch((err) => {
                console.error('fatal:' + err)
                process.exit(0);
            })
        });
    }

    addGooglePhotosMediaItems(mediaItems) {
            var array = [];
            for (var i in mediaItems) {
                var bulk_l1 = {};
                bulk_l1.index = {
                    _index: 'media',
                    _type: 'google_photos',
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