import Base from "./Base.js";

import crypto from "crypto";
//@ts-ignore
import { hex2b64, Key } from "node-bignumber";
import { AuthentificationParams, ClientJsToken, ConstructorOptions, DoLoginParams, RsaKey } from "./interfaces.js";

class Steam extends Base {
    constructor(options?: ConstructorOptions) {
        super(options);
    }

    private async getClientJsToken() {
        const clientJsToken: ClientJsToken = await this.doRequest(`https://steamcommunity.com/chat/clientjstoken`, {
            headers: {
                Referer: `https://steamcommunity.com/market/`
            }
        });
        return clientJsToken;
    }

    async getAuthStatus() {
        return (await this.getClientJsToken()).logged_in;
    }

    private async getRsaKey(login: string) {
        try {
            const response: RsaKey = await this.doRequest(`https://steamcommunity.com/login/getrsakey/`, {
                method: 'POST',
                headers: {
                    Referer: `https://steamcommunity.com/login/home/?goto=`
                },
                form: {
                    username: login,
                    donotcache: Date.now()
                }
            });
            if (response.success) {
                const key = new Key();
                key.setPublic(response.publickey_mod, response.publickey_exp);
                return { key, timestamp: response.timestamp };
            } else {
                throw new Error(`Can't get rsa key: ${JSON.stringify(response)}`);
            }
        } catch (err) {
            throw new Error(`Can't get Rsa Key: ${err}`);
        }
    }
    private async doLogin(options: DoLoginParams) {
        try {
            const { key, timestamp } = await this.getRsaKey(options.accountName);
            const encryptedPassword = hex2b64(key.encrypt(options.password));
            const twoFactorCode = options.shared_secret ? this.generateTwoFactorCode(options.shared_secret) : options.twoFactorCode;

            const response = await this.doRequest(`https://steamcommunity.com/login/dologin/`, {
                method: 'POST',
                headers: {
                    Referer: `https://steamcommunity.com/login/home/?goto=`
                },
                followRedirect: true,
                form: {
                    donotcache: Date.now(),
                    username: options.accountName,
                    password: encryptedPassword,
                    twofactorcode: twoFactorCode,
                    emailauth: null,
                    loginfriendlyname: null,
                    captchagid: -1,
                    captcha_text: null,
                    emailsteamid: timestamp,
                    remember_login: true,
                    tokentype: -1,
                }
            });
            console.log(response);
        } catch (err) {
            throw new Error(`Cant't get rsa key: ${err}`);
        }
    }
    private bufferizeSecret(shared_secret: string) {
        try {
            if (shared_secret.match(/[0-9a-f]{40}/i)) {
                return Buffer.from(shared_secret, 'hex')
            } else {
                return Buffer.from(shared_secret, 'base64')
            }
        } catch (err) {
            throw new Error(`Can't bufferize shared_secret: ${err}`);
        }
    }

    generateTwoFactorCode(shared_secret: string) {
        try {
            const bufferizedSharedSecret = this.bufferizeSecret(shared_secret);
            const time = Math.floor(Date.now() / 1000);
            const buffer = Buffer.allocUnsafe(8);
            buffer.writeUInt32BE(0, 0);
            buffer.writeUInt32BE(Math.floor(time / 30), 4);

            const hmac = crypto.createHmac('sha1', bufferizedSharedSecret);
            const bufferHmac = hmac.update(buffer).digest();

            const start = bufferHmac[19] & 0x0f;
            const slicedHmac = bufferHmac.slice(start, start + 4);
            let fullcode = slicedHmac.readUInt32BE(0) & 0x7fffffff;

            const chars = '23456789BCDFGHJKMNPQRTVWXY';

            let code = '';
            for (let i = 0; i < 5; i++) {
                code += chars.charAt(fullcode % chars.length);
                fullcode /= chars.length;
            }

            return code;
        } catch (err) {
            throw new Error(`Can't generate auth code: ${err}`);
        }
    }

    async authentificate(params: AuthentificationParams) {
        try {
            const isLoggedIn = await this.getAuthStatus();
            if (isLoggedIn) {
                throw new Error(`Already logged in`);
            }
            if (params.accountName && params.password && (params.shared_secret || params.twoFactorCode)) {
                await this.doLogin({
                    accountName: params.accountName,
                    password: params.password,
                    shared_secret: params.shared_secret,
                    twoFactorCode: params.twoFactorCode
                });
            } else {
                throw new Error(`Authentification params is not valid`);
            }


        } catch (err) {
            throw new Error(`Can't authentificate in Steam: ${err}`);
        }

    }
}

export default Steam;