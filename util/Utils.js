import Jaczfetch from 'jaczfetch';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

export const encrypt = (data, secret) => {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', secret, iv);
    return `${cipher.update(JSON.stringify(data), 'utf8', 'base64') + cipher.final('base64')}.${iv.toString('base64')}`;
};

export const decrypt = (token, secret) => {
    const [d, iv] = token.split('.');
    if (!iv) return null;
    const decipher = createDecipheriv('aes-256-cbc', secret, Buffer.from(iv, 'base64'));
    return JSON.parse(decipher.update(d, 'base64', 'utf8') + decipher.final('utf8'));
};

export const fetchURL = (method = 'GET', url, options = {}) => {
    const request = new Jaczfetch(method, url, {
        headers: { 'User-Agent': 'Botcord www.botcord.org', Authorization: options.authorization },
        query: options.query || {},
        data: options.data || undefined
    });

    return request
        .then(res => res.body)
        .catch(error => {
            Error.captureStackTrace(error);
            const err = new Error(`${url} - ${error.message}`);
            Object.assign(err, error);
            err.stack = error.stack;
            err.url = url;
            console.error(err);
            throw err;
        });
};

