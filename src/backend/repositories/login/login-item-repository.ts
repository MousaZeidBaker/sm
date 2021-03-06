import ResourceGroupsTaggingAPIClient from "aws-sdk/clients/resourcegroupstaggingapi";
import SSM from "aws-sdk/clients/ssm";

import { LoginItem } from "../../models/login/login-item";

export declare class LoginItemRepository {
  constructor(
    ssmClient: SSM,
    resourceGroupsTaggingAPIClient: ResourceGroupsTaggingAPIClient
  );

  /**
   * Create item
   *
   * @param {string} title
   * @param {string} path
   * @param {string} username
   * @param {string} secret
   * @param {string} otp
   * @return {Promise<LoginItem>}
   */
  create(
    title: string,
    path: string,
    username: string,
    secret: string,
    otp: string,
    note: string
  ): Promise<LoginItem>;

  /**
   * Get item
   *
   * @param {string} id
   * @param {number} version
   * @return {Promise<LoginItem>}
   */
  get(id: string, version?: number): Promise<LoginItem>;

  /**
   * List items
   *
   * @return {Promise<LoginItem[]>}
   */
  list(): Promise<LoginItem[]>;

  /**
   * Update item
   *
   * @param {string} id
   * @param {string} title
   * @param {string} path
   * @param {string} username
   * @param {string} secret
   * @param {string} otp
   * @return {Promise<LoginItem>}
   */
  update(
    id: string,
    title?: string,
    path?: string,
    username?: string,
    secret?: string,
    otp?: string,
    note?: string
  ): Promise<LoginItem>;

  /**
   * Delete item
   *
   * @param {string} id
   * @return {Promise<void>}
   */
  delete(id: string): Promise<void>;
}
