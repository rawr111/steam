import Base from "./Base.js";
import { AuthentificationParams, ConstructorOptions, CreateBuyOrderParams } from "./interfaces.js";
declare class Steam extends Base {
    constructor(options?: ConstructorOptions);
    private getClientJsToken;
    /**Получить статус авторизации. Проверить авторизованы ли мы сейчас в Steam? Действительны ли наши куки*/
    isAuthorized(): Promise<boolean>;
    private getRsaKey;
    private doLogin;
    private generateSessionID;
    private bufferizeSecret;
    /**(основные методы) Сгенерировать 5-значный вход для входа в аккаунт. shared_secret - код из maFile*/
    generateTwoFactorCode(shared_secret: string): string;
    /**(основной метод) Пройти авторизацию в Steam (получить доступ к аккаунту) */
    authorization(params: AuthentificationParams): Promise<string[]>;
    /**(работа с тп) Поставить запрос на покупку предмета */
    createBuyOrder(params: CreateBuyOrderParams): Promise<void>;
    /**(работа с тп) Возвращает все точки на графике, отображаемые в Steam (date, price, quantity) В ДОЛЛАРАХ США!
     * @param market_hash_name - полное название предмета
     * @param options - настройки запроса
    */
    getLastSales(market_hash_name: string, options?: {
        /**прокси в формате http://username:password@ip:port, через который пройдет запрос (он будет приоритетнее, чем тот, который передан в конструктор класса) */
        proxy?: string;
        /**Использовать ли куки аккаунта в запросе */
        withLogin?: boolean;
    }): Promise<[Date, number, number][]>;
}
export default Steam;
