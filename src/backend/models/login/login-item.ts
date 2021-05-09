import { encrypt, decrypt } from '../../lib/encryption/encryption'
import { Item, CreateItemArguments } from '../item'

interface LoginItemDecryptedData {
  title: string
  path: string
  username: string
  secret: string
}

export class LoginItem extends Item {
  constructor(arg: CreateItemArguments) {
    super(arg)
  }

  public static encryptData(
    decryptedData: LoginItemDecryptedData,
    passphrase?: string
  ): string {
    const data = JSON.stringify(decryptedData)
    passphrase = passphrase ? passphrase : process.env.ENCRYPTION_PASSPHRASE || ''
    return encrypt(data, passphrase)
  }

  public getDecryptedData(): LoginItemDecryptedData {
    const decryptedData = decrypt(this.encryptedData, this.passphrase)
    return JSON.parse(decryptedData)
  }
}
