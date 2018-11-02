import { randomBytes, createCipheriv, createDecipheriv, Decipher } from "crypto";

export const encrypt = (data: string, secret: string) => {
    const iv = randomBytes(16);
    const cipher = createCipheriv("aes-256-cbc", secret, iv);
    return `${cipher.update(JSON.stringify(data), "utf8", "base64") + cipher.final("base64")}.${iv.toString("base64")}`;
};

export const decrypt = (token: string, secret: string) => {
    const [d, iv]: string[] = token.split(".");
    if (!iv) return null;
    const decipher: Decipher = createDecipheriv("aes-256-cbc", secret, Buffer.from(iv, "base64"));
    return JSON.parse(decipher.update(d, "base64", "utf8") + decipher.final("utf8"));
};
