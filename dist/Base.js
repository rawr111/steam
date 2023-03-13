import got from "got";
import { HttpsProxyAgent } from 'hpagent';
import settings from "./settings.js";
class Base {
    proxy;
    cookies = {};
    userAgent;
    constructor(options) {
        this.proxy = options ? (options.proxy ? options.proxy : null) : null;
        this.userAgent = options && options.userAgent ? options.userAgent : settings.defaultUserAgent;
    }
    setCookies(cookies) {
        this.cookies = cookies;
    }
    getCookies() {
        return this.cookies;
    }
    clearCookies() {
        this.cookies = {};
    }
    packCookiesToString(cookies) {
        let result = ``;
        for (const cookieName in cookies) {
            const cookie = cookies[cookieName];
            result += `${cookieName}=${cookie.value}; `;
        }
        return result;
    }
    parseCookiesString(cookieStr) {
        const splittedCookies = cookieStr.split('; ');
        const expiresCookie = splittedCookies.filter(c => c.includes('Expires'))[0];
        const cookie = {
            name: splittedCookies[0].split('=')[0],
            value: splittedCookies[0].split('=')[1],
            expires: expiresCookie ? new Date(expiresCookie.split('=')[1]) : null
        };
        return cookie;
    }
    setDirtyCookies(cookies) {
        for (const cookie of cookies) {
            const parsedCookie = this.parseCookiesString(cookie);
            this.cookies[parsedCookie.name] = parsedCookie;
        }
    }
    async doRequest(url, requestOptions, options) {
        try {
            const headers = requestOptions && requestOptions.headers ? requestOptions.headers : {};
            const cookies = requestOptions && requestOptions.headers && requestOptions.headers.cookie ? this.parseCookiesString(requestOptions.headers.cookie) : {};
            delete (requestOptions?.headers);
            const allCookies = { ...this.cookies, ...cookies };
            const actualRequestOptions = {
                headers: {
                    cookie: options?.useSavedCookies === false ? `` : this.packCookiesToString(allCookies),
                    'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36`,
                    ...headers
                },
                ...requestOptions
            };
            if (options?.customProxy) {
                actualRequestOptions.agent = {
                    https: this.getProxyAgent(options.customProxy),
                    http: this.getProxyAgent(options.customProxy)
                };
            }
            else if (this.proxy && (options?.useDefaultProxy || typeof (options) === 'undefined'))
                actualRequestOptions.agent = {
                    https: this.getProxyAgent(this.proxy),
                    http: this.getProxyAgent(this.proxy)
                };
            console.log(actualRequestOptions);
            const response = await got(url, actualRequestOptions);
            const newCookies = response.headers["set-cookie"];
            if (newCookies)
                this.setDirtyCookies(newCookies);
            if (options?.isJsonResult || typeof (options?.isJsonResult) === 'undefined') {
                try {
                    return JSON.parse(response.body);
                }
                catch (err) {
                    throw new Error(`Cant parse response. It's not in json format`);
                }
            }
            else {
                return response.body;
            }
        }
        catch (err) {
            throw new Error(`Request error: ${err}`);
        }
    }
    getProxyAgent(proxy) {
        return new HttpsProxyAgent({
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 256,
            maxFreeSockets: 256,
            scheduling: 'lifo',
            proxy: proxy
        });
    }
}
export default Base;
