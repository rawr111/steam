export interface ClientJsToken {
    logged_in: boolean,
    steamid: string,
    accountid: number,
    account_name: string,
    token: string
}

export interface ConstructorOptions {
    proxy?: string
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
    Session: MaFileSession
}

export interface AuthentificationParams {
    accountName?: string;
    password?: string;
    shared_secret?: string;
    twoFactorCode?: string;
    maFile?: MaFile;
}

export interface DoLoginParams {
    accountName: string;
    password: string;
    shared_secret?: string;
    twoFactorCode?: string;
}

export interface Cookies {
    sessionid?: string;
    steamCountry?: string;
}

export interface Cookie {
    name: string;
    value: string;
    expires: Date | null;
}

export interface CreateBuyOrderParams {
    market_hash_name: string;
    appid: number;
    price: number;
    quantity: number;
    currency: 1 | 2 | 3 | 4 | 5;
}