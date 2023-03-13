import { OptionsOfTextResponseBody } from "got";
import { ConstructorOptions, Cookie } from "./interfaces.js";
declare class Base {
    private proxy;
    private cookies;
    private userAgent;
    constructor(options?: ConstructorOptions);
    setCookies(cookies: {
        [cookieName: string]: Cookie;
    }): void;
    getCookies(): {
        [cookieName: string]: Cookie;
    };
    clearCookies(): void;
    protected packCookiesToString(cookies: {
        [cookieName: string]: Cookie;
    }): string;
    protected parseCookiesString(cookieStr: string): Cookie;
    protected setDirtyCookies(cookies: string[]): void;
    protected doRequest(url: string, requestOptions?: OptionsOfTextResponseBody, options?: {
        /**Ответ сервера в формате json? */
        isJsonResult?: boolean;
        /**Использовать ли прокси, установленный в конструкторе класса? Если параметр не передается, то прокси используется */
        useDefaultProxy?: boolean;
        /**Использовать ли сохраненные в оперативной памяти куки? */
        useSavedCookies?: boolean;
        /**Использовать ли на этот запрос отдельный прокси? Этот параметр перекрывает дефолтный прокси */
        customProxy?: string;
    }): Promise<any>;
    private getProxyAgent;
}
export default Base;
