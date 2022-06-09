import { decrypt, encrypt } from "../../lib/encryption/encryption";
import { CreateItemArguments, Item } from "../item";

export interface LoginItemDecryptedData {
  title: string;
  path: string;
  username: string;
  secret: string;
  otp: string;
  note: string;
}

export class LoginItem extends Item {
  constructor(arg: CreateItemArguments) {
    super(arg);
  }

  public static encryptData(
    decryptedData: LoginItemDecryptedData,
    passphrase?: string
  ): string {
    const data = JSON.stringify(decryptedData);
    passphrase = passphrase
      ? passphrase
      : process.env.ENCRYPTION_PASSPHRASE || "";
    return encrypt(data, passphrase);
  }

  public getDecryptedData(): LoginItemDecryptedData {
    const decryptedData = decrypt(this.encryptedData, this.passphrase);
    return JSON.parse(decryptedData);
  }
}
