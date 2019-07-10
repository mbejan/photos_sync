const debug = require('debug')('gphotos.js')

const fs = require('fs');
const readline = require('readline');
const {
    google
} = require('googleapis');

const Photos = require('googlephotos');

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

class GPhotos {

    constructor() {
        this.inited = false;
        this.oauth2Client = undefined;
        this.photos = undefined;
    }

    init() {
        return new Promise((resolve, reject) => {
            this.initToken().then((res, rej) => {
                this.photos = new Photos("\"" + res.credentials.access_token + "\"");
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
                fs.readFile(TOKEN_PATH, (err, content) => {
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
                        this.refreshToken().then ( () => {
                            console.log('token refreshed!');
                        }).catch ( (err) => {
                            reject(err);
                        });
                        
                    }
                });
            });
            });
    }

    refreshToken() {
        return new Promise((resolve, reject) => {
            fs.readFile(TOKEN_PATH, (err, content) => {
                this.oauth2Client.refreshAccessToken(function(err, token) {
                    console.log('Token refreshed');
                    if (err) reject(err)
                    else {
                        // Store the token to disk for later program executions
                        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                            if (err) reject(err);
                            else
                                console.log('Token stored to', TOKEN_PATH);
                        });
                        resolve();
                    }
                });
            });
        });

    }

    downloadMeta() {
        const filters = new this.photos.Filters();
        const mediaTypeFilter = new this.photos.MediaTypeFilter(this.photos.MediaType.ALL_MEDIA);
        filters.setMediaTypeFilter(mediaTypeFilter);

        var that = this;

        Promise.resolve().then(function resolver() {
            if (counter++ < 3)
                 return that.downloadMetaPage(filters).then((mi) => {
                    if (mi.mediaItems.length > 0) {
                        console.log(mi.mediaItems);
                    }
                    else {
                        debug('got shit')
                    }
                }).then(resolver)
        }).catch((err) => {
            console.log('done!'+err);
            process.exit(0);
        });


    }

    downloadMetaPage(filters) {
        return new Promise((res, rej) => {
            debug('downloadMetaPage');
            this.photos.mediaItems.search(filters, 50, this.nextPageToken).then((rr) => {
                this.nextPageToken = rr.nextPageToken;
                res(rr);
            }).catch( (err) => {
                rej(err);
            });
        });
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

module.exports = GPhotos;