import {remote} from "electron";
const {BrowserWindow, dialog} = remote;
import parse from "url-parse";
import qs from "querystring"

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'

export function googleSignIn (redirectUri: string, clientId: string, clientSecret: string, refresh: string = null): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
        console.log(refresh);
        if (refresh) {
            return fetchAccessTokens(redirectUri, clientId, clientSecret, refresh).then((tokens) => {
                resolve(tokens);
                return tokens;
            }).catch((error) => {
                reject(error);
            });
        } else if (!refresh) {
            return signInWithPopup(redirectUri, clientId).then((code) => {
                return fetchAccessTokens(redirectUri, clientId, clientSecret, refresh, code).then((tokens) => {
                    resolve(tokens);
                    return tokens;
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        }
    });
}

export function signInWithPopup (redirect_uri: string, client_id: string): Promise<string | number | boolean | readonly string[] | readonly number[] | readonly boolean[]> {
    return new Promise((resolve, reject) => {
        const authWindow = new BrowserWindow({
            width: 500,
            height: 600,
            show: false
        });
        console.log(authWindow)

        // TODO: Generate and validate PKCE code_challenge value
        const urlParams = {
            response_type: 'code',
            redirect_uri,
            client_id: client_id,
            scope: 'profile email https://www.googleapis.com/auth/spreadsheets'
        }
        const authUrl = `${GOOGLE_AUTHORIZATION_URL}?${new URLSearchParams(urlParams)}`

        function handleNavigation (url: string) {
            const query = parse(url, true).query
            if (query) {
                if (query.error) {
                    reject(new Error(`There was an error: ${query.error}`))
                } else if (query.code) {
                    // Login is complete
                    authWindow.removeAllListeners('closed')
                    setImmediate(() => authWindow.close())

                    // This is the authorization code we need to request tokens
                    resolve(query.code)
                }
            }
        }

        authWindow.on('closed', () => {
            // TODO: Handle this smoothly
            dialog.showErrorBox('Error: Window Terminated', 'Auth window was closed by user')
        })

        authWindow.webContents.on('will-navigate', (event, url) => {
            handleNavigation(url)
        })

        authWindow.webContents.on('will-redirect', (event, url) => {
            handleNavigation(url)
        })

        authWindow.loadURL(authUrl, {userAgent: 'Chrome'})
        authWindow.show();
    })
}

export async function fetchAccessTokens (redirect_uri: string, client_id: string, client_secret: string, refresh: string = null, code: string | number | boolean | readonly string[] | readonly number[] | readonly boolean[] = null): Promise<Record<string, any>> {
    const opts = refresh ?
        {
            client_id: client_id,
            redirect_uri: redirect_uri,
            grant_type: 'refresh_token',
            client_secret,
            refresh_token: refresh
        } :
        {
            code,
            client_id: client_id,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code',
            client_secret
        };
    const response = await fetch(GOOGLE_TOKEN_URL + `?${qs.stringify(opts)}`, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST'
    });

    return await response.json()
}


