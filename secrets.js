import crypto from "crypto";
export default {
  encrypt: data => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      process.env.CLIENTSECRET,
      iv
    );
    return `${cipher.update(JSON.stringify(data), "utf8", "base64") +
      cipher.final("base64")}.${iv.toString("base64")}`;
  }
};
