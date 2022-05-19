import CryptoJS from "crypto-js";

/**
 * Encrypt data
 *
 * @param {string} data - The data to encrypt
 * @param {string} passphrase - The encryption passphrase
 * @return {string} The encrypted data
 */
export function encrypt(data: string, passphrase: string): string {
  if (!passphrase) throw new Error("Encryption passphrase must be set!");
  const encryptedValue = CryptoJS.AES.encrypt(data, passphrase);
  return encryptedValue.toString();
}

/**
 * Decrypt data
 *
 * @param {string} data - The data to decrypt
 * @param {string} passphrase - The encryption passphrase
 * @return {string} The decrypted data
 */
export function decrypt(data: string, passphrase: string): string {
  if (!passphrase) throw new Error("Encryption passphrase must be set!");
  const decryptedValue = CryptoJS.AES.decrypt(data, passphrase);
  return decryptedValue.toString(CryptoJS.enc.Utf8);
}
