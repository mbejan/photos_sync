DELETE google_drive
DELETE google_photos

get google_drive
get google_photos

PUT google_drive 
{
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


PUT google_photos 
{
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
                                            "type": "double"
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
                            "type": "keyword"
                        }
                    }
                }
            }
        }
    }
}

POST media / google_photos / AHTElGI6UDPd0DAQAKkR9rY5kOFq9T2yFAF6HLI4a - H4FJt5XMe36iWt4qXlWBVqZKQ7Y - Tqck - lnZwncTNTrh6k18YPgT_nVg / {
    "id": "AHTElGI6UDPd0DAQAKkR9rY5kOFq9T2yFAF6HLI4a-H4FJt5XMe36iWt4qXlWBVqZKQ7Y-Tqck-lnZwncTNTrh6k18YPgT_nVg",
    "productUrl": "https://photos.google.com/lr/photo/AHTElGI6UDPd0DAQAKkR9rY5kOFq9T2yFAF6HLI4a-H4FJt5XMe36iWt4qXlWBVqZKQ7Y-Tqck-lnZwncTNTrh6k18YPgT_nVg",
    "baseUrl": "https://lh3.googleusercontent.com/lr/AGWb-e54i-88rymZE5mMhsS1YWeKDKk2yo9hbqufnafdaiQYifsN6gl10EpvLJ0RLZKpuZzoljUgLKRO8QRkl13D8l168PC_rCHfFW9H0SooyVjyxy2zn2poPPw60ZAn6Y7SstR2vP8LtM1dX26laoRV-Pcd9_91J9RkPtGkQgbalnFBDcAr18jTGxLrYbzVZKog5hs9Gr62dLvClt89kBHETcgxY4fMIXXaI6lEFhDJPBqQh0LIbovdAp8HedXmWP3EfJ5p8VfCLL9VL4_xq90S09UQTbCjzpp3TSR7dSj_w1XlwfNFRFnNoPpbjfbqgZsLkfHBMEZWPHTjqXZFxyMEJqVG9-fFGkmP1zEaExgKxNTTthqogmCMcrRbw2KM4l_QogEHctiyz_Tb5BxqFgv3eUaU4i24lsbfrdWKRMmDspFTRnV--oDjLX2MEdUD7jwQHpBxspCx_kpF2PWFQDifJl50vdFWeOE-HZaYwXIDkYL0VF-yLvMS8l_r3TcIhFwyPsjl2lo9cI8DLL19a2XLyzFDEb2ld8rdk0BroNX2vyZCzzrT23Zsx5IDocRDbdRbioa8t6KrvxFzyV2xuLtvYQOKfuk69WvR9zSgPanj22hK0gUOG65E7jinssGDYgOvdPE34ZYp_IaeccK5mB1_kSj1lewK0mftOEEfo1HxXg_1d3xg3ixpjSmo1SN2Tkrc22icFrGXlMg5N2lCzrL2_JTiTi-AC6lGPLV1JXpYPZ_-DkTrE_E0VC5XnloGfZXtj1rWbY_0Y41vFwVDRUEnpeH-pAzJN-y4rHd5C3uJF8AQjdKGXQMU79NpprrP0VZ_a32AM7sFOU0XkBABMvFZCJw-Lv9J1RiiLF6JF_nRapUv8dTB1OVWD_jPjgQRU3E_dnRoJgLUBOmO",
    "mimeType": "image/jpeg",
    "mediaMetadata": {
        "creationTime": "2019-06-30T05:51:06Z",
        "width": "3908",
        "height": "3036",
        "photo": {}
    },
    "filename": "Bridge0.jpg"
}