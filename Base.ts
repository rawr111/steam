import got, { Headers, OptionsOfTextResponseBody } from "got";
import { HttpsProxyAgent } from 'hpagent';
import { ConstructorOptions } from "./interfaces";

class Base {
  private proxy: string | null;
  private cookies: { [cookieName: string]: string | null } = {};

  constructor(options?: ConstructorOptions) {
    this.proxy = options ? (options.proxy ? options.proxy : null) : null;
  }

  protected packCookiesToString(cookies: { [cookieName: string]: string | null }) {
    let result = ``;
    for (const cookieName in cookies) {
      const cookieValue = cookies[cookieName];
      if (cookieValue)
        result += `${cookieName}=${cookieValue}; `;
      else
        result += `${cookieName}; `;
    }
    return result;
  }
  protected parseCookiesString(cookies: string) {
    const splittedCookies = cookies.split('; ');
    const result: { [cookieName: string]: string | null } = {};
    for (const cookie of splittedCookies) {
      const splittedCookie = cookie.split('=');
      if (splittedCookie.length === 1) {
        result[splittedCookie[0]] = null
      } else if (splittedCookie.length === 2) {
        if (typeof (splittedCookie[1]) === 'undefined') {
          result[splittedCookie[0]] = null;
        } else {
          result[splittedCookie[0]] = splittedCookie[1];
        }
      } else {
        throw new Error(`Not valid cookies string`);
      }
    }
    return result;
  }
  protected setCookies(cookies: string[]) {
    for (const cookie of cookies) {
      const parsedCookies = this.parseCookiesString(cookie);
      this.cookies = { ...this.cookies, ...parsedCookies };
    }
  }
  protected async doRequest(url: string, requestOptions?: OptionsOfTextResponseBody, options?: { isJsonResult?: boolean, useProxy?: boolean, useCookies?: boolean }) {
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

      if (this.proxy && (options?.useProxy || typeof (options) === 'undefined')) actualRequestOptions.agent = {
        https: this.getProxyAgent(),
        http: this.getProxyAgent()
      }
      const response = await got(url, actualRequestOptions);
      const newCookies = response.headers["set-cookie"];
      if (newCookies) this.setCookies(newCookies);
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
  private getProxyAgent() {
    return new HttpsProxyAgent({
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 256,
      maxFreeSockets: 256,
      scheduling: 'lifo',
      proxy: `http://${this.proxy}`
    });
  }
}

export default Base;