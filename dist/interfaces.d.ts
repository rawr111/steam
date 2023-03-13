export interface ClientJsToken {
    logged_in: boolean;
    steamid: string;
    accountid: number;
    account_name: string;
    token: string;
}
export interface ConstructorOptions {
    /**Прокси должен быть в следующем формате: http://username:password@login:password */
    proxy?: string;
    /**Это свойство User-Agent, которое будет в headers каждого запроса.  */
    userAgent?: string;
}
export interface RsaKey {
    success: boolean;
    publickey_mod: string;
    publickey_exp: string;
    timestamp: string;
    token_gid: string;
}
export interface MaFileSession {
    SessionID: string;
    SteamLogin: string | null;
    SteamLoginSecure: string;
    WebCookie: string;
    OAuthToken: string;
    SteamID: string;
}
export interface MaFile {
    shared_secret: string;
    serial_number: string;
    revocation_code: string;
    uri: string;
    server_time: string;
    account_name: string;
    token_gid: string;
    identity_secret: string;
    secret_1: string;
    status: number;
    device_id: string;
    fully_enrolled: boolean;
    Session: MaFileSession;
}
export interface AuthentificationParams extends DoLoginParams {
    /**Объект формата maFile (как в sda) */
    maFile?: MaFile;
}
export interface DoLoginParams {
    /**Логин steam аккаунта (ЭТО НЕ НИКНЕЙМ)*/
    accountName: string;
    /**Пароль от Steam аккаунта */
    password: string;
    /**Это свойство необходимо для генерации two factor кодов (которые в моб. приложении). Можно достать из maFile (sda) */
    shared_secret?: string;
    /**Непосредственно guard код (тот самый 5-значный код, который живет 30 секунд) */
    twoFactorCode?: string;
}
export interface Cookie {
    name: string;
    value: string;
    expires: Date | null;
}
export interface CreateBuyOrderParams {
    /**Полное и уникальное рыночное название предмета */
    market_hash_name: string;
    /**Id игры в системе Steam. у CSGO = 730. у Dota2 = 570. у tf2 = 440 */
    appid: number;
    /**Цена в копейках/центах */
    price: number;
    /**Количество предметов в запросе */
    quantity: number;
    /**Валюта, в которой будет выставлен запрос. Должна совпадать с валютой аккаунта. usd = 1; euro = 2; rub = 5; */
    currency: number;
}
