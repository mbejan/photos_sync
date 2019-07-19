DELETE google_drive
DELETE google_photos

GET google_photos
POST google_drive/_search
{
    "query": {
        "bool": {
            "must": [
                {
                    "match": {"mimeType":"application/vnd.google-apps.folder"}
                }
            ]
            }
        }
    }

}



GET google_photos/_search
{
  "query":
      { "bool":
         { "must":
            [ { "match": { "filename.keyword": "DSC_4540.jpg" } }],
           "filter":
            [ { "range":
                 { "mediaMetadata.creationTime":
                    { "gte": "2000/08/14", "lte": "2022/08/14", "format": "yyyy/MM/dd" } } } ] } } } 
}

GET google_drive/_search
{
        "query": {
            "bool": {
                "must_not": [
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

GET /google_photos,google_drive/_stat

GET google_photos/_search
{
    "query": {
        "bool": {
            "must": [
                {
                    "match": {
                        "filename.keyword": "DSC00971.jpg"
                    }
                },
                {
                    "match": {
                        "mediaMetadata.width": 6000
                    }
                },
                {
                    "match": {
                        "mediaMetadata.height": 4000
                    }
                },
                {
                    "match": {
                        "mediaMetadata.photo.cameraMake.keyword": "SONY"
                    }
                },
                {
                    "match": {
                        "mediaMetadata.photo.cameraModel.keyword": "ILCE-6000"
                    }
                },
                {
                    "match": {
                        "mediaMetadata.photo.focalLength": 16
                    }
                },
                {
                    "term": {
                        "mediaMetadata.photo.apertureFNumber": 4
                    }
                },
                {
                    "match": {
                        "mediaMetadata.photo.isoEquivalent": 100
                    }
                }
            ],
            "filter": [
                {
                    "range": {
                        "mediaMetadata.creationTime": {
                            "gte": "1900/04/29",
                            "lte": "2020/04/29",
                            "format": "yyyy/MM/dd"
                        }
                    }
                }
            ]
        }
    }
}






GET google_drive/_search
{
    "sort": [
        {
            "name": {
                "order": "desc"
            }
        }
    ],
    "query": {
        "bool": {
            "must": [
                {
                    "regexp": {
                        "name":"2[0-9].*"
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



PUT google_drive 
{
    "mappings": {
       // "google_drive": {
            "properties": {
                "id": {
                    "type": "text"
                },
                "name": {
                    "type": "text"
                },
                "mimeType": {
                    "type": "text"
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
                    "type": "text"
                },
                "fullFileExtension": {
                    "type": "text"
                },
                "fileExtension": {
                    "type": "text"
                },
                "md5Checksum": {
                    "type":"text"
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
                            "type": "text"
                        },
                        "cameraMake": {
                            "type": "text"
                        },
                        "cameraModel": {
                            "type": "text"
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
                            "type": "text"
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



PUT google_photos
{
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
                            "type": "text"
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
                                            "type": "float",
                                            "store":true
                                        },
                                        "apertureFNumber": {
                                            "type": "float",
                                            "store":true
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
                                            "type": "double"
                                        }
                                    }
                                }
                            }
                        },
                        "filename": {
                            "type": "keyword",
                            "index":"true"
                        }
                    }
                }
            }
        }
    //}
}

