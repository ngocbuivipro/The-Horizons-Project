import crypto from 'crypto';
import dotenv from 'dotenv';
import {ENCRYPTION_IV, ENCRYPTION_KEY} from "../config/env.js";
dotenv.config();

const algorithm = 'aes-256-cbc';
// Ensure these variables exist in your .env file
const key = Buffer.from(ENCRYPTION_KEY, 'utf-8'); // Must be 32 chars
const iv = Buffer.from(ENCRYPTION_IV, 'utf-8');   // Must be 16 chars

export const encrypt = (text) => {
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
};

export const decrypt = (text) => {
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};
