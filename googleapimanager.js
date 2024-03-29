const debug = require('debug')('googleapimanager.js')

const fs = require('fs');
const readline = require('readline');
const {
    google
} = require('googleapis');

const Photos = require('googlephotos');
var _ = require('underscore');
/*global*/
var counter = 0;

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly',
                'https://www.googleapis.com/auth/photoslibrary'
];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

class GoogleApiManager {

    constructor(esc) {
        this.inited = false;
        this.oauth2Client = undefined;
        this.photos = undefined;
        this.drive = undefined;
        this.esclient = esc;
    }

    init() {
        return new Promise((resolve, reject) => {
            this.initToken().then((res, rej) => {
                this.photos = new Photos("\"" + res.credentials.access_token + "\"");
                this.drive = google.drive({
                    version: 'v3',
                    auth: this.oAuth2Client
                });

                resolve();
            }).catch((rej) => {
                console.error(rej);
                reject();
            });
        });
    }

    initToken() {
        return new Promise((resolve, reject) => {
            // Load client secrets from a local file.
            fs.readFile('credentials.json', (err, content) => {
                if (err) return console.log('Error loading client secret file:', err);
                fs.readFile(TOKEN_PATH, (err, token) => {
                    if (err) { //no token.json
                        // Authorize a client with credentials, then call the Google Drive API.
                        this.authorize(JSON.parse(content)).then((res) => {
                            this.inited = true;
                            this.oauth2Client = res;
                            resolve(res);
                        }).catch((rej) => {
                            reject(rej);
                        });
                    } else { //try to refresh the token
                        this.refreshToken(JSON.parse(content)).then((res) => {
                            ;
                            this.inited = true;
                            this.oAuth2Client = res;
                            resolve(res)
                        }).catch((err) => {
                            reject(err);
                        });

                    }
                });
            });
        });
    }

    refreshToken(credentials) {
        return new Promise((resolve, reject) => {
            fs.readFile(TOKEN_PATH, (err, content) => {
                const {
                    client_secret,
                    client_id,
                    redirect_uris
                } = credentials.installed;

                const oAuth2Client = new google.auth.OAuth2(
                    client_id, client_secret, redirect_uris[0]);

                oAuth2Client.setCredentials(JSON.parse(content));
                oAuth2Client.refreshAccessToken(function (err, token) {
                    if (err) reject(err)
                    else {
                        // Store the token to disk for later program executions
                        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                            if (err) reject(err);
                            else {
                                console.log('Token stored to', TOKEN_PATH);
                                resolve(oAuth2Client);
                            }
                        });
                    }
                });
            });
        });

    }


    downloadDriveMeta() {
        debug('downloadDriveMeta');

        var that = this;

        Promise.resolve().then(function resolver() {
            //if (counter++ < 2)
            return that.downloadDriveMetaPage().then((mi) => {
                if (mi.data.files.length > 0) {
                    counter += mi.data.files.length
                    console.log('[counter] ' + counter)
                    that.esclient.addBulkItems(mi.data.files, 'google_drive');
                } else {
                    throw new Error("done");
                }
            }).then(resolver)
        }).catch((err) => {
            console.log('done! ' + err);
            process.exit(0);
        });

    }
    downloadDriveMetaPage() {
        return new Promise((res, rej) => {
            debug('downloadDriveMetaPage');

            this.drive.files.list({
                includeRemoved: false,
                spaces: 'drive',
                pageToken: this.nextPageToken,
                fields: 'nextPageToken, files(createdTime, fileExtension, fullFileExtension, md5Checksum, size, id, imageMediaMetadata, mimeType, modifiedTime, name, originalFilename, parents, videoMediaMetadata )',
                q: "mimeType contains 'image/' or mimeType contains 'video/' or mimeType = 'application/vnd.google-apps.folder'"
            }).then((response) => {
                this.nextPageToken = response.data.nextPageToken;
                if (this.nextPageToken == undefined)
                    rej('done')
                else
                    res(response);
            }).catch((err) => {
                rej(err);
            });

        })
    }


    downloadPhotosMeta() {
        const filters = new this.photos.Filters();
        const mediaTypeFilter = new this.photos.MediaTypeFilter(this.photos.MediaType.ALL_MEDIA);
        filters.setMediaTypeFilter(mediaTypeFilter);

        var that = this;

        Promise.resolve().then(function resolver() {
            //if (counter++ < 2)
<<<<<<< HEAD
            return that.downloadPhotosMetaPage(filters).then((mi) => {
                if (mi.mediaItems.length > 0) {
                    counter += mi.mediaItems.length
                    console.log('[counter] ' + counter)
                    that.esclient.addBulkItems(mi.mediaItems, 'google_photos');
                } else {
                    throw new Error("done");
                }
            }).then(resolver).catch((err) => {
                console.log('done! ' + err);
                process.exit(0);
            });
=======
                return that.downloadPhotosMetaPage(filters).then((mi) => {
                    if (mi != undefined && mi.mediaItems != undefined && mi.mediaItems.length > 0) {
                        counter += mi.mediaItems.length
                        console.log('[counter] ' + counter)
                        that.esclient.addBulkItems(mi.mediaItems, 'google_photos');
                    } else {
                        throw new Error("done");
                    }
                }).then(resolver)
        }).catch((err) => {
            console.log('done! ' + err);
            process.exit(0);
>>>>>>> a7e8ea6bef22be194c7470484ab83f473a6de4b8
        });
    }

    downloadPhotosMetaPage(filters) {
        return new Promise((res, rej) => {
            debug('downloadMetaPage');
            this.photos.mediaItems.search(filters, 5, this.nextPageToken).then((rr) => {
                this.nextPageToken = rr.nextPageToken;
                res(rr);
            }).catch((err) => {
                rej(err);
            });
        });
    }

    listAlbumPage() {
        return new Promise((res, rej) => {
            this.photos.albums.list(10, this.nextPageToken).then((rr) => {
                this.nextPageToken = rr.nextPageToken;

                res(rr);
            }).catch((err) => {
                rej(err);
            });
        })
    }

    listAllAlbums() {
        this.nextPageToken = undefined;
        var that = this;

        return new Promise((res_albums, _errors) => {
            var _albums = [];
            Promise.resolve().then(function resolver() {
                return that.listAlbumPage().then((a) => {
                    if (a.albums != undefined) {
                        _albums = _albums.concat(a.albums);
                    }
                    
                    if ( a.nextPageToken == undefined ) {
                        res_albums(_albums);
                    }
                    
                }).then(resolver).catch((err) => {
                    res_albums(_albums);
                });
            });
        })
    }

    createAlbum(name) {
        return new Promise((res, rej) => {
            debug('createAlbum');
            this.listAllAlbums().then((list) => {

                var album = _.find(list, (it) => {
                    return (it.title == name)
                });
                
                if (_.isEmpty(album)) {
                    this.photos.albums.create(name).then((rr) => {
                        res(rr);
                    })
                } else {
                    res(album);
                }

            }).catch((err) => {
                console.error("fatal error in createAlbum" + err);
                process.exit(0);
            });

        });
    }

    addMediaItems(album_id, ids) {
        //require('request-promise').debug = 1;
/*         this.photos.mediaItems.search(album_id).then ( (r) => {
            console.log(r);
            process.exit(0);
        });
 */        return this.photos.albums.batchRemoveMediaItems(album_id, ["AHTElGLS2Vck_nZSBwOD0kal206-rgaan69D4xK_xiN4MYf3H3Ddd-5SkC-x_WzDLMeTamNAc4Y2EqyZ2S8oXgTyZMetgmtOpw"]);

    }

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    authorize(credentials, callback) {
        return new Promise((res, rej) => {
            const {
                client_secret,
                client_id,
                redirect_uris
            } = credentials.installed;
            this.oAuth2Client = new google.auth.OAuth2(
                client_id, client_secret, redirect_uris[0]);

            // Check if we have previously stored a token.
            fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) this.getAccessToken(res, rej);
                else {

                    this.oAuth2Client.setCredentials(JSON.parse(token));
                    res(this.oAuth2Client);
                }
            });
        });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    getAccessToken(res, rej) {
        const authUrl = this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            this.oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                this.oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) rej(err);
                    else
                        console.log('Token stored to', TOKEN_PATH);
                });
                res(this.oAuth2Client);
            });
        });
    }


}

module.exports = GoogleApiManager;