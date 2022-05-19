import { nanoid } from "../lib/nanoid/nanoid";

export interface CreateItemArguments {
  id?: string;
  version?: number;
  lastModifiedDate?: Date;
  encryptedData: string;
}

export abstract class Item {
  /**
   * The id of the item
   */
  public id: string;

  /**
   * The version of the item, starts from 1 and increases for every update
   */
  public version: number;

  /**
   * The date of the last time the item got modified
   */
  public lastModifiedDate: Date;

  /**
   * The encrypted item data. The data varies for different item types.
   */
  public encryptedData: string;

  /**
   * The passphrase to encrypt the data with
   */
  protected passphrase: string;

  constructor(args: CreateItemArguments) {
    this.id = args.id ? args.id : nanoid();
    this.version = args.version ? args.version : 1;
    this.lastModifiedDate = args.lastModifiedDate
      ? args.lastModifiedDate
      : new Date();
    this.encryptedData = args.encryptedData;

    this.passphrase = process.env.ENCRYPTION_PASSPHRASE || "";
  }

  /**
   * Get decrypted item data
   */
  public abstract getDecryptedData(): any;
}
