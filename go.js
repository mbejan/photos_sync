const fs = require('fs');
const readline = require('readline');
const {
    google
} = require('googleapis');
const Photos = require('googlephotos');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/photoslibrary'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    authorize(JSON.parse(content), processAll);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
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
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function processAll(auth) {

    const drive = google.drive({
        version: 'v3',
        auth
    });

    getRootFolder(drive).then((google_photos) => {
        getAllFolders(drive, google_photos[0].id).then((albums) => {
            getAllFolders(drive, albums[0].id).then((all) => {
                //console.log(all);
                var ids = [];
                getAllFiles(drive, all[0].id).then((files) => {
                    console.log(files);
                    files.map((file) => {
                        ids.push(file.name);
                    });
                }).then(() => {
                    const filters = new photos.Filters();
                     const photos = new Photos(auth.credentials.access_token);
                    // Adding a media type filter filter (all, video or photo)
                    const mediaTypeFilter = new photos.MediaTypeFilter(photos.MediaType.ALL_MEDIA);
                    filters.setMediaTypeFilter(mediaTypeFilter);
                    
                   
                    photos.mediaItems.search(filters).then ( (rr) => {
                        console.log(rr);    
                    })
                    
                    
                    /*const id = 'AHTElGIfI_fG3i3z49FnFTA-9CGq6ovxLF-B2--pzRwiEIvQ8LpdSbaLKjpIa0SGmFMXPL6Gr93h'
                    photos.albums.batchAddMediaItems(id, ids).then((res) => {
                        console.log(res);

                    }).catch(err => {
                        console.log('catched an error!'+err);
                    })*/
                });

            });
        });
    }).catch(err => {
        console.log(err)
    });


    /*
    const photos = new Photos(auth.credentials.access_token);
    
    photos.albums.list().then((res) => {
        //if (err) return console.log('The API returned an error: ' + err);
       // console.log(res)
      ;
       
    }).catch(err => {
        console.log('catched an error!');
    })*/
}

function getRootFolder(drive) {
    return new Promise((res, rej) => {
        drive.files.list({
            q: "mimeType = 'application/vnd.google-apps.folder' and name = 'Google Photos'",
            pageSize: 1000,
            fields: 'nextPageToken, files(id, name)',
        }, (er, re) => {
            if (er) return rej('The API returned an error: ' + er);
            const files = re.data.files;
            if (files.length) {
                res(files);
            }
            else {
                rej('No files found.');
            }
        })
    });
}

function getAllFolders(drive, root_id) {
    return new Promise((res, rej) => {
        drive.files.list({
            q: "mimeType = 'application/vnd.google-apps.folder' and '" + root_id + "' in parents",
            pageSize: 1,
            fields: 'nextPageToken, files(id, name)',
        }, (er, re) => {
            if (er) return rej('The API returned an error: ' + er);
            const files = re.data.files;
            if (files.length) {
                res(files);
            }
            else {
                rej('No files found.');
            }
        })
    });
}

function getAllFiles(drive, root_id) {
    return new Promise((res, rej) => {
        drive.files.list({
            q: "(mimeType contains 'image/' or mimeType contains 'video/') and '" + root_id + "' in parents",
            pageSize: 1,
            fields: 'nextPageToken, files(id, name)',
        }, (er, re) => {
            if (er) return rej('The API returned an error: ' + er);
            const files = re.data.files;
            if (files.length) {
                res(files);
            }
            else {
                rej('No files found.');
            }
        })
    });
}
