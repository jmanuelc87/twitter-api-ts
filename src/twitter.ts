import * as https from "https";
import * as hmacsha1 from "hmacsha1";
import * as hash from 'hmacsha1';

export class Twitter {

    private url = 'api.twitter.com';

    private accessToken: string;
    private accessTokenSecret: string;
    private consumerKey: string;
    private consumerSecret: string;

    constructor(
        accessToken: string,
        accessTokenSecret: string,
        consumerKey: string,
        consumerSecret: string
    ) {
        this.accessToken = accessToken;
        this.accessTokenSecret = accessTokenSecret;
        this.consumerKey = consumerKey;
        this.consumerSecret = consumerSecret;
    }


    public request(method: string, path: string, params: Map<string, string>) {
        let options = {
            host: this.url,
            path: this.buildPath(path, params),
            port: 443,
            method: method.toUpperCase(),
            headers: {
                "Authorization": this.buildHeaderString('https', method, path, params)
            }
        };

        return new Promise<any>((resolve, reject) => {

            let req = https.request(options, (response) => {
                let data = '';

                response.on('data', chunk => {
                    data += chunk;
                });

                response.on('end', () => {
                    resolve(JSON.parse(data));
                });
            });

            req.on('error', err => {
                reject(err);
            })

            req.end();
        });
    }



    buildHeaderString(protocol: string, method: string, path: string, params: Map<string, string>) {
        // build the oauth defined parameters
        let oauthParams: Map<string, string> = this.buildOAuthHeader();
        // join params and oauthParams
        let result = this.joinMaps(params, oauthParams);
        // encode both params in a string
        let encodedParams = this.encodeMapToQueryString(result);
        let completeUrl = `${protocol}://${this.url}${path}`
        let signatureBase = this.createSignatureBase(method, completeUrl, encodedParams);
        let hash = this.generateHashSignature(signatureBase);
        oauthParams.set('oauth_signature', hash);

        let header = 'OAuth ';

        oauthParams.forEach((value, key) => {
            header += `${this.encode(key)}="${this.encode(value)}", `;
        });

        header = header.slice(0, -1);
        return header;
    }


    /**
     * Builds a path and encodes the params to be formed as an endpoint.
     * 
     * @param path the endpoint of the url
     * @param params the params to be encoded
     */
    buildPath(path: string, params: Map<string, string>): string {
        return `${path}?${this.encodeMapToQueryString(params)}`;
    }

    /**
     * Generates an OAuth header conforming to the twitter specification
     */
    buildOAuthHeader() {
        let auth = new Map<string, any>();
        auth.set('oauth_consumer_key', this.consumerKey);
        auth.set('oauth_nonce', this.buildOAuthNOnce());
        auth.set('oauth_signature_method', 'HMAC-SHA1');
        auth.set('oauth_timestamp', new Date().getTime() / 1000);
        auth.set('oauth_token', this.accessToken);
        auth.set('oauth_version', '1.0');
        return auth;
    }

    /**
     * Creates a base string from the specific parameters
     * 
     * @param method     HTTP verb
     * @param url        The url to be added to the base string
     * @param parameters The parameters to be added to the base string
     */
    createSignatureBase(method: string, url: string, parameters: string) {
        let urlEncoded = this.encode(url);
        let parametersEncoded = this.encode(parameters);
        let output = `${method.toUpperCase()}&${urlEncoded}&${parametersEncoded}`;
        return output;
    }

    /**
     * Generate a hash using the hmacsha1 function
     * 
     * @param data the data to be hashed
     */
    generateHashSignature(data: string) {
        let signingKey = `${this.consumerSecret}&${this.accessTokenSecret}`;
        let hash = hmacsha1(signingKey, data);
        return hash;
    }

    /**
     * Joins several maps into one map
     * 
     * @param args array of maps to be joined in one map
     */
    joinMaps(...args: Map<string, string>[]) {
        let unsorted = new Map<string, string>();

        for (let item of args) {
            item.forEach((value, key) => {
                // percent encode every key and value that will be signed
                unsorted.set(key, value);
            });
        }

        return unsorted;
    }

    /**
     * Sorts a map in alphabetical order by encoded key
     * 
     * @param args the map to be sorted
     */
    sortMapAlphabetical(args: Map<string, string>) {
        let params: Array<string> = new Array<string>();
        args.forEach((value, key) => {
            params.push(key);
        });
        params.sort();
        return params;
    }

    /**
     * Creates an encoded set of key and values in an encoded URI
     * 
     * @param args the map to create an encoded uri
     */
    encodeMapToQueryString(args: Map<string, string>) {
        let encoded = '';
        let sorted: Array<string> = this.sortMapAlphabetical(args);

        sorted.forEach((key: string) => {
            let value = args.get(key) as string;
            encoded += `${this.encode(key)}=${this.encode(value)}&`;
        });
        encoded = encoded.slice(0, -1);
        return encoded;
    }

    encode(value: string) {
        return encodeURIComponent(value).replace(/[!*()']/, (char: string) => {
            return '%' + char.charCodeAt(0).toString(16);
        });
    }

    /**
     * Generates a random string and convert it to base 64 removing some non-word characters
     */
    buildOAuthNOnce(): string {
        let to = 0x0;
        let data = '';

        for (let i = 0; i < 32; i++) {
            to = 0x0;
            for (let j = 0; j < 8; j++) {
                to |= (Math.random() >= 0.5 ? 1 : 0);
                to = to << 1;
            }
            data += String.fromCodePoint(to);
        }

        data = Buffer.from(data).toString('base64');

        for (let i = 0; i < data.length; i++) {
            let d = data.charAt(i);
            if (/[\=\!\¡\+\?\¿\.\:\,\;\}\{\]\[\*\¨\*\~\`]/.test(d)) {
                data = data.replace(d, (str: string, ...args: any[]) => {
                    let symbol = Math.floor((Math.random() * (90 - 65 + 1)) + 65)
                    return String.fromCodePoint(symbol);
                });
            }
        }

        return data
    }

}
