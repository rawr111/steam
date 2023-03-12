import got, { Headers, OptionsOfTextResponseBody } from "got";
import { HttpsProxyAgent } from 'hpagent';
import { ConstructorOptions, Cookie } from "./interfaces.js";

class Base {
  private proxy: string | null;
  private cookies: { [cookieName: string]: Cookie } = {};

  constructor(options?: ConstructorOptions) {
    this.proxy = options ? (options.proxy ? options.proxy : null) : null;
  }

  public setCookies(cookies: { [cookieName: string]: Cookie }) {
    this.cookies = cookies;
  }
  public getCookies() {
    return this.cookies;
  }
  public clearCookies() {
    this.cookies = {};
  }
  protected packCookiesToString(cookies: { [cookieName: string]: Cookie }) {
    let result = ``;
    for (const cookieName in cookies) {
      const cookie = cookies[cookieName];
      result += `${cookieName}=${cookie.value}; `;
    }
    return result;
  }
  protected parseCookiesString(cookieStr: string): Cookie {
    const splittedCookies = cookieStr.split('; ');
    const expiresCookie = splittedCookies.filter(c => c.includes('Expires'))[0];

    const cookie: Cookie = {
      name: splittedCookies[0].split('=')[0],
      value: splittedCookies[0].split('=')[1],
      expires: expiresCookie ? new Date(expiresCookie.split('=')[1]) : null
    }
    return cookie;
  }
  protected setDirtyCookies(cookies: string[]) {
    for (const cookie of cookies) {
      const parsedCookie = this.parseCookiesString(cookie);
      this.cookies[parsedCookie.name] = parsedCookie;
    }
  }
  protected async doRequest(url: string, requestOptions?: OptionsOfTextResponseBody, options?: {
    isJsonResult?: boolean,
    useProxy?: boolean,
    useCookies?: boolean,
    customProxy?: string
  }) {
    try {
      const headers = requestOptions && requestOptions.headers ? requestOptions.headers : {};
      const cookies = requestOptions && requestOptions.headers && requestOptions.headers.cookie ? this.parseCookiesString(requestOptions.headers.cookie as string) : {};
      delete (requestOptions?.headers);
      const allCookies = { ...this.cookies, ...cookies };
      const actualRequestOptions: OptionsOfTextResponseBody = {
        headers: {
          cookie: options?.useCookies === false ? `` : this.packCookiesToString(allCookies),
          'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36`,
          ...headers
        },
        ...requestOptions
      }

      if (options?.customProxy) {
        actualRequestOptions.agent = {
          https: this.getProxyAgent(options.customProxy),
          http: this.getProxyAgent(options.customProxy)
        }
      } else if (this.proxy && (options?.useProxy || typeof (options) === 'undefined'))
        actualRequestOptions.agent = {
          https: this.getProxyAgent(this.proxy),
          http: this.getProxyAgent(this.proxy)
        }
      console.log(actualRequestOptions);
      const response = await got(url, actualRequestOptions);
      const newCookies = response.headers["set-cookie"];
      if (newCookies) this.setDirtyCookies(newCookies);
      if (options?.isJsonResult || typeof (options?.isJsonResult) === 'undefined') {
        try {
          return JSON.parse(response.body);
        } catch (err) {
          throw new Error(`Cant parse response. It's not in json format`);
        }
      } else {
        return response.body;
      }
    } catch (err) {
      throw new Error(`Request error: ${err}`);
    }
  }
  private getProxyAgent(proxy: string) {
    return new HttpsProxyAgent({
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 256,
      maxFreeSockets: 256,
      scheduling: 'lifo',
      proxy: `http://${proxy}`
    });
  }
}

export default Base;