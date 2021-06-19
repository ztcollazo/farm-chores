'use strict';
import {remote} from "electron";
const {BrowserWindow, dialog} = remote;

/**
 * Trello client.js, rewritten in TypeScript.
 *
 * The expected options are:<br>
 *   version - The API version<br>
 *   apiEndpoint - The URL that API calls should go to (e.g.
 *     https://api.trello.com)<br>
 *   authEndpoint - The URL the authentication requests should go to (e.g.
 *     https://trello.com)<br>
 *   key - the application key to use in API requests.
 *
 *   token - Optional.  The token to use in API requests.
 */
const isFunction = (val: unknown): boolean => typeof val === 'function';

interface ITrelloParams {
    version?: number;
    apiEndpoint?: string,
    authEndpoint?: string,
    key: string,
    token?: string
}

interface IAuthorizeParams {
    type: 'redirect' | 'popup' | 'window',
    name: string,
    persist: boolean,
    interactive: boolean,
    scope: {
        read: boolean,
        write: boolean,
        account: boolean
    },
    expiration: '1hour' | '1day' | '30days' | 'never',
    success: CallableFunction,
    error: CallableFunction
}

interface IRestParams extends IQueryParams {
    method: MethodTypes
}

interface IQueryParams {
    path: string,
    params: Record<string, unknown>,
    success: CallableFunction,
    error: CallableFunction
}

const fromEntries = (xs: [string|number|symbol, any][]) => xs.reduce((acc, [key, value]): Record<string, unknown> => ({...acc, [key]: value}), {});

function cloneDeep(src: Record<string, any>): Record<string, any> {
    if (Array.isArray(src)) {
        return src.map(cloneDeep)
    }
    if (src instanceof RegExp) {
        return src
    }
    if (!src) {
        return src
    }
    if (typeof src !== 'object') {
        return src
    }
    if (src instanceof Date) {
        return src
    }
    return fromEntries(
        Object.entries(src).map(
            ([key, val]) => ([key, cloneDeep(val)])
        )
    );
}

const deferred: Record<string, Array<CallableFunction>> = {};

const waitUntil = function (name: string, fx: CallableFunction) {
    if (!deferred[name]) {
        deferred[name] = [];
    }
    deferred[name].push(fx);
};

const isReady = function (name: string, value: unknown) {
    if (deferred[name]) {
        const fxs = deferred[name];
        delete deferred[name];
        for (const fx of fxs) {
            fx(value);
        }
    }
};

type MethodTypes = 'POST' | 'GET' | 'PUT' | 'DELETE';

interface IAjaxOpts<T, A> {
    url: string,
    type: MethodTypes,
    data: Record<string, string>,
    success: (json: T) => A,
    error: (args: Error) => any
}

const ajax = <T, A>(opts: IAjaxOpts<T, A>): Promise<A> => {
    return fetch(`${opts.url}?${new URLSearchParams(opts.data)}`, {
        method: opts.type,
    })
    .then(res => res.json().then(opts.success))
    .catch(opts.error)
}

let readStorage: CallableFunction; // eslint-disable-line @typescript-eslint/no-empty-function
let writeStorage: CallableFunction; // eslint-disable-line @typescript-eslint/no-empty-function

const parseRestArgs = function (args: any) {
    const {method, ...rest} = args;
    let {path, params, success, error} = rest;
    if (isFunction(params)) {
        error = success;
        success = params;
        params = {};
    }

    // Get rid of any leading
    path = path.replace(new RegExp(`^/*`), '');

    return [method, path, params, success, error];
};

if (window.localStorage != null) {
    const storagePrefix = 'trello_';
    readStorage = (k: string): string | void => window.localStorage.getItem(storagePrefix + k);
    writeStorage = function (k: string, value: string): void {
        if (value === null) {
            window.localStorage.removeItem(storagePrefix + k);
            return;
        }
        try {
            window.localStorage.setItem(storagePrefix + k, value);
        } catch (error) {} // eslint-disable-line no-empty
    };
} else {
    readStorage = (): void => null;
    writeStorage = (): void => null;
}

/**
 * The `Trello` class.
 *
 * ```javascript
 * new Trello(opts); // see above for options.
 * ```
 */

class Trello {
    intentEndpoint: string;
    baseURL: string;
    private __token: string;
    private __key: string;
    readonly __version: number;
    del: (...args: unknown[]) => unknown;
    args: ITrelloParams;
    constructor({version = 1, apiEndpoint = "https://api.trello.com", authEndpoint = "https://trello.com", key, token}: ITrelloParams) {
        const args = {version, apiEndpoint, authEndpoint, key, token};

        this.__version = version;
        this.__key = key;
        if (token) {
            this.token = token;
        }
        this.intentEndpoint = authEndpoint;
        this.args = args;
        this.del = this.delete;
        this.baseURL = `${apiEndpoint}/${version}/`
    }
    getAction(id: string, params: Record<string, unknown>, success: CallableFunction, error: CallableFunction) {
        return this.get({path: `actions/${id}`, params, success, error});
    }
    getCard(id: string, params: Record<string, unknown>, success: CallableFunction, error: CallableFunction) {
        return this.get({path: `cards/${id}`, params, success, error});
    }
    getChecklist(id: string, params: Record<string, unknown>, success: CallableFunction, error: CallableFunction) {
        return this.get({path: `checklists/${id}`, params, success, error});
    }
    getBoard(id: string, params: Record<string, unknown>, success: CallableFunction, error: CallableFunction) {
        return this.get({path: `boards/${id}`, params, success, error});
    }
    getList(id: string, params: Record<string, unknown>, success: CallableFunction, error: CallableFunction) {
        return this.get({path: `lists/${id}`, params, success, error});
    }
    getMember(id: string, params: Record<string, unknown>, success: CallableFunction, error: CallableFunction) {
        return this.get({path: `members/${id}`, params, success, error});
    }
    getOrganization(id: string, params: Record<string, unknown>, success: CallableFunction, error: CallableFunction) {
        return this.get({path: `organizations/${id}`, params, success, error});
    }
    getBoardCards(boardId: string, params: Record<string, unknown>, success: CallableFunction, error: CallableFunction) {
        return this.get({path: `boards/${boardId}/cards`, params, success, error});
    }
    getBoardLists(boardId: string, params: Record<string, unknown>, success: CallableFunction, error: CallableFunction) {
        return this.get({path: `boards/${boardId}/lists`, params, success, error});
    }
    getAllBoards<T, A>(params: Record<string, unknown>, success: CallableFunction, error: CallableFunction): Promise<A> {
        return this.get<T, A>({path: 'members/me/boards', params, success, error})
    }
    updateCard(cardId: string, params: Record<string, unknown>, success: CallableFunction, error: CallableFunction) {
        return this.put({path: `cards/${cardId}`, params, success, error});
    }
    getCardChecklists(cardId: string, params: Record<string, unknown>, success: CallableFunction, error: CallableFunction) {
        return this.get({path: `cards/${cardId}/checklists`, params, success, error});
    }
    updateCheckItem(cardId: string, checklistId: string, checkItemId: string, params: Record<string, unknown>, success: CallableFunction, error: CallableFunction) {
        return this.put({path: `cards/${cardId}/checklist/${checklistId}/checkItem/${checkItemId}/state`, params, success, error});
    }
    authorizeURL(args: Record<string, any>): string {
        const baseArgs: {response_type: string, key: string} = {
            response_type: 'token',
            key: this.args.key,
        };
        const finishedArgs = {
            scope: Object.keys(args.scope).reduce((a, b) => {
                if (args.scope[b] === true) {
                    if (a !== "") {
                        a += `,${b}`
                    } else {
                        a += b;
                    }
                }
                return a;
            }, "")
        }
        const finalArgs = Object.assign(baseArgs, args, finishedArgs)

        const url = `${this.args.authEndpoint}/${this.version}/authorize?${new URLSearchParams(
            finalArgs
        )}`

        console.log(url);

        return url;
    }
    get<T, A>(args: IQueryParams): Promise<A> {
        return this.rest<T, A>({method: "GET", ...args});
    }
    post<T, A>(args: IQueryParams): Promise<A> {
        return this.rest<T, A>({method: "POST", ...args});
    }
    put<T, A>(args: IQueryParams): Promise<A> {
        return this.rest<T, A>({method: "PUT", ...args});
    }
    delete<T, A>(args: IQueryParams): Promise<A> {
        return this.rest<T, A>({method: "DELETE", ...args});
    }
    get version(): number {
        return this.__version;
    }

    get key(): string {
        return this.__key;
    }
    set key(newKey: string) {
        this.__key = newKey;
    }

    get token(): string {
        return this.__token;
    }
    set token(newToken: string) {
        this.__token = newToken;
    }

    get tokenFound(): boolean {
        return !!readStorage("token");
    }

    /**
     * Issue a REST call to the API
     *
     * .rest(method, path, params, success, error)<br>
     * .rest(method, path, success, error)<br>
     *
     * method - The HTTP method to use/simulate (e.g. GET, POST, PUT, DELETE)<br>
     * path - The API path to use (e.g. "members/me")<br>
     * params - Optional.  A hash of values to include in the querystring/body<br>
     * &nbsp; (e.g. { filter: "open", fields: "name,desc" })<br>
     * success - Function to call when the request succeeds<br>
     * error - Function to call when the request fails<br>
     */

    rest<T, A>(args: IRestParams): Promise<A> {
        console.log(args);
        const [method, path, params, success, error] = parseRestArgs(args);

        const restOpts = {
            url: `${this.baseURL}${path}`,
            type: method,
            data: {} as Record<string, string>,
            success,
            error,
        };

        // Only include the key if it's been set to something truthy
        if (this.__key) {
            restOpts.data.key = this.__key;
        }
        // Only include the token if it's been set to something truthy
        if (this.token) {
            restOpts.data.token = this.token;
        }

        if (params != null) {
            Object.assign(restOpts.data, params);
        }

        return ajax<T, A>(restOpts);
    }

    // Has Trello been authorized to issue requests on a user's behalf?
    authorized = (): boolean => !!this.token

    // Clear any existing authorization
    deauthorize(): void {
        this.token = null;
        writeStorage('token', this.token);
    }

    authorizeWithElectron(persistToken: () => unknown, config: Record<string, any>): void {
        waitUntil('authorized', (isAuthorized: boolean) => {
            if (isAuthorized) {
                persistToken();
                if (isFunction(config.success)) {
                    config.success(this.token);
                }
                return;
            }
            if (isFunction(config.error)) {
                config.error("Trello authorization failed.");
            }
        });

        let authWindow = new BrowserWindow({
            show: false,
            width: 600,
            height: 800,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                contextIsolation: false
            }
        });
        authWindow.loadURL(this.authorizeURL({
            ...config,
            redirect_uri: "http://localhost:3000/main_window",
            callback_method: "fragment",
            response_type: "token"
        }));
        authWindow.show();

        const handleRedirect = (url: string) => {
            const raw_code = /token=([^&]+)/.exec(url) || null;
            const code = raw_code && raw_code.length > 1 ? raw_code[1] : null;
            const error = !url.includes("https://trello.com/1/authorize") ? /error=(.+)$/.exec(url) : undefined;

            if (code || error) {
                // Close the browser if code found or error
                authWindow.destroy();
            }

            // If there is a code, proceed to get token from github
            if (code) {
                this.token = code;
                isReady('authorized', this.authorized());
            } else if (error) {
                dialog.showErrorBox(
                    "Authentication Failed", "Oops! Something went wrong and we couldn't" +
                    'log you in using Trello. Please try again.'
                );
            }
        }
        const handler = (event: Event, url: string) => handleRedirect(url);
        authWindow.webContents.on('will-navigate', handler);
        authWindow.webContents.on('will-redirect', handler);
        authWindow.on('close', () => authWindow = null)
    }

    authorizeWithPopup(persistToken: () => unknown, authorizeOpts: Record<string, any>): void {
        waitUntil('authorized', (isAuthorized: boolean) => {
            if (isAuthorized) {
                persistToken();
                if (isFunction(authorizeOpts.success)) {
                    authorizeOpts.success(this.token);
                }
                return;
            }
            if (isFunction(authorizeOpts.error)) {
                authorizeOpts.error("Trello authorization failed.");
            }
        });

        const width = 720;
        const height = 800;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        const originMatch = new RegExp(`^[a-z]+://[^/]*`).exec(window.location as unknown as string);
        const origin = originMatch && originMatch[0];
        const authWindow = window.open(
            this.authorizeURL({
                return_url: origin,
                callback_method: 'postMessage',
                scope: authorizeOpts.scope,
                expiration: authorizeOpts.expiration,
                name: authorizeOpts.name,
                response_type: 'fragment'
            }),
            'trello',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        const receiveMessage =  (event: Record<string, any>) => {
            if (
                event.origin !== this.args.authEndpoint ||
                event.source !== authWindow
            ) {
                return;
            }

            if (event.source != null) {
                event.source.close();
            }

            if (event.data != null && /[0-9a-f]{64}/.test(event.data)) {
                this.token = event.data;
            } else {
                this.token = null;
            }

            if (isFunction(window.removeEventListener)) {
                window.removeEventListener('message', receiveMessage, false);
            }
            isReady('authorized', this.authorized());
        };

        // Listen for messages from the auth window
        if (isFunction(window.addEventListener)) {
            window.addEventListener('message', receiveMessage, false);
        }
    }

    /**
     * Request a token that will allow us to make API requests on a user's behalf
     *
     * authorizeOpts =
     *   type - "redirect" or "popup"<br>
     *   name - Name to display<br>
     *   persist - Save the token to local storage?<br>
     *   interactive - If false, don't redirect or popup, only use the stored
     *   token, if one exists<br>
     *   scope - The permissions we're requesting<br>
     *   expiration - When we want the requested token to expire ("1hour",
     *     "1day", "30days", "never")<br>
     */
    authorize(userOpts: IAuthorizeParams): void {
        const authorizeOpts = cloneDeep(Object.assign<IAuthorizeParams, IAuthorizeParams>(
            {
                type: 'redirect',
                name: "Example",
                persist: true,
                interactive: true,
                scope: {
                    read: true,
                    write: false,
                    account: false,
                },
                expiration: '30days',
                success: (): void => null,
                error: (): void => null
            },
            userOpts
        ));

        const regexToken = /[&#]?token=([0-9a-f]{64})/;

        const persistToken = (): void => {
            if (authorizeOpts.persist && this.token) {
                writeStorage('token', this.token);
            }
        };

        if (authorizeOpts.persist) {
            if (this.token == null) {
                this.token = readStorage('token');
            }
        }

        if (this.token == null) {
            const match = regexToken.exec(window.location.hash);
            if (match) {
                this.token = match[1];
            }
        }

        if (this.token) {
            persistToken();
            window.location.hash = window.location.hash.replace(regexToken, '');
            authorizeOpts.success(this.token);
            return;
        }

        // If we aren't in interactive mode, and we didn't get the token from
        // storage or from the hash, then we error out here
        if (!authorizeOpts.interactive) {
            if (isFunction(authorizeOpts.error)) {
                authorizeOpts.error("Token not found. Please turn on interactive mode to retrieve it again.");
            }
            return;
        }

        const scope = Object.keys(authorizeOpts.scope || {})
            .reduce((accum, k) => {
                if (authorizeOpts.scope[k]) {
                    accum.push(k);
                }
                return accum;
            }, [])
            .join(',');

        switch (authorizeOpts.type) {
            case 'popup':
                this.authorizeWithPopup(persistToken, authorizeOpts);
                break;
            case 'window':
                this.authorizeWithElectron(persistToken, authorizeOpts);
                break;
            default:
                // We're leaving the current page now; but the user should be calling
                // .authorize({ interactive: false }) on page load
                window.location = this.authorizeURL({
                    redirect_uri: window.location.href,
                    callback_method: 'fragment',
                    scope,
                    expiration: authorizeOpts.expiration,
                    name: authorizeOpts.name,
                }) as unknown as Location;
        }
    }

    /**
     * Request that a card be created, using the provided name, description, and
     * url.
     *
     * options =<br>
     * &nbsp;  name - The name to use for the card<br>
     * &nbsp;  desc - The description to use for the card (optional)<br>
     * &nbsp;  url - A url to attach to the card (optional)<br>
     * &nbsp;  next = a method to be called once the card has been created.  The method
     * should take two arguments, an error and a card.  If next is not defined
     * then a promise that resolves to the card will be returned.
     */
    addCard(options: Record<string, any>, next: (e?: Error, card?: unknown) => void): undefined | Promise<unknown> {
        const baseArgs = {
            mode: 'popup',
            source: this.__key || window.location.host,
        };

        const getCard = (callback: (e?: Error, card?: unknown) => void): Window | void => {
            const returnUrl = function (e: any): void {
                window.removeEventListener('message', returnUrl);
                try {
                    const data = JSON.parse(e.data);
                    if (data.success) {
                        callback(null, data.card);
                        return;
                    }
                    callback(new Error(data.error));
                } catch (error) {} // eslint-disable-line no-empty
            };

            if (isFunction(window.addEventListener)) {
                window.addEventListener('message', returnUrl, false);
            }

            const width = 500;
            const height = 600;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            return window.open(
                `${this.intentEndpoint}/add-card?${new URLSearchParams(Object.assign(baseArgs, options))}`,
                'trello',
                `width=${width},height=${height},left=${left},top=${top}`
            );
        };

        if (next != null) {
            getCard(next);
            return undefined;
        }
        if (Promise) {
            return new Promise((resolve, reject) =>
                getCard((err, card) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(card);
                    }
                })
            );
        }
        getCard(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
        return undefined;
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Trello;
}

export default Trello;
