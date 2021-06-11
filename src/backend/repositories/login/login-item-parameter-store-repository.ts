import { getParametersByPathRecursive } from '../../lib/aws/aws-parameter-store/list-parameters'
import { getParameter } from '../../lib/aws/aws-parameter-store/get-parameter'
import { deleteParameter } from '../../lib/aws/aws-parameter-store/delete-parameter'
import { createParameter, updateParameter } from '../../lib/aws/aws-parameter-store/put-parameter'
import { LoginItem } from '../../models/login/login-item'
import { createAwsServiceClients, ServiceName } from '../../lib/aws/aws-service-clients'
import { getCognitoIdentityUUID, getCognitoIdentityId } from '../../lib/aws/aws-cognito-federated-identity'
import { NotFoundException } from '../../errors/exceptions'
import SSM from 'aws-sdk/clients/ssm'
import { LoginItemRepository } from './login-item-repository'

export class LoginItemParameterStoreRepository implements LoginItemRepository {
  ssmClient: SSM

  constructor(ssmClient: SSM) {
    this.ssmClient = ssmClient
  }

  public static async build(idToken: string): Promise<LoginItemParameterStoreRepository> {
    const ssmClient = await createAwsServiceClients(ServiceName.SSM, idToken)

    return new LoginItemParameterStoreRepository(ssmClient)
  }

  public async create(title: string, path: string, username: string, secret: string, note: string): Promise<LoginItem> {
    const encryptedData = LoginItem.encryptData({
      title: title,
      path: path,
      username: username,
      secret: secret,
      note: note
    })

    const newItem = new LoginItem({
      encryptedData: encryptedData
    })

    await createParameter(
      this.ssmClient,
      `/sm/${getCognitoIdentityUUID()}/logins/${newItem.id}`,
      newItem.encryptedData,
      [
        {
          Key: 'identityId',
          Value: getCognitoIdentityId()
        },
        {
          Key: 'type',
          Value: 'logins'
        }
      ]
    )

    return newItem
  }

  public async get(id: string, version?: number): Promise<LoginItem> {
    let name = `/sm/${getCognitoIdentityUUID()}/logins/${id}`

    // Append version if provided
    if (version) name += `:${version}`

    let response: SSM.GetParameterResult
    try {
      response = await getParameter(this.ssmClient, name)
    } catch (err) {
      switch(err.name) {
        case 'ParameterNotFound':
        // AccessDeniedException is considered not found due to the IAM policy is
        // configured so that AccessDeniedException is thrown on any parameter
        // not belong to the currently logged in user, even if they do not exist.
        case 'AccessDeniedException':
        case 'ParameterVersionNotFound': {
          throw new NotFoundException
        }
        default: {
          throw err
        }
      }
    }

    return new LoginItem({
      id: id,
      version: response.Parameter?.Version,
      lastModifiedDate: response.Parameter?.LastModifiedDate,
      encryptedData: response.Parameter?.Value as string
    })
  }

  public async list(): Promise<LoginItem[]> {
    const path = `/sm/${getCognitoIdentityUUID()}/logins/`
    const response = await getParametersByPathRecursive(this.ssmClient, path)

    if (!response) return [] // no items found

    return response.map(item => {
      const id = item.Name?.substr(item.Name?.lastIndexOf('/') + 1) || ''

      return new LoginItem({
        id: id,
        version: item?.Version,
        lastModifiedDate: item?.LastModifiedDate,
        encryptedData: item?.Value as string
      })
    })
  }

  public async update(id: string, title?: string, path?: string, username?: string, secret?: string, note?: string): Promise<LoginItem> {
    const oldItem = await this.get(id)

    const encryptedData = LoginItem.encryptData({
      title: title || '',
      path: path || '',
      username: username || '',
      secret: secret || '',
      note: note || ''
    })

    const updatedItem = new LoginItem({
      id: oldItem.id,
      version: oldItem.version + 1,
      encryptedData: encryptedData
    })

    // Check if any item data has been edited, if not then just return the same item
    if (JSON.stringify(updatedItem.getDecryptedData()) === JSON.stringify(oldItem.getDecryptedData())) return oldItem

    const name = `/sm/${getCognitoIdentityUUID()}/logins/${id}`
    try {
      await updateParameter(this.ssmClient, name, updatedItem.encryptedData)
    } catch (err) {  
      switch(err.name) {
        case 'ParameterNotFound':
        // AccessDeniedException is considered not found due to the IAM policy is
        // configured so that AccessDeniedException is thrown on any parameter
        // not belong to the currently logged in user, even if they do not exist.
        case 'AccessDeniedException': {
          throw new NotFoundException
        }
        default: {
          throw err
        }
      }
    }

    return updatedItem
  }

  public async delete(id: string): Promise<void> {
    const name = `/sm/${getCognitoIdentityUUID()}/logins/${id}`
    try {
      await deleteParameter(this.ssmClient, name)
    } catch (err) {
      switch(err.name) {
        case 'ParameterNotFound':
        // AccessDeniedException is considered not found due to the IAM policy is
        // configured so that AccessDeniedException is thrown on any parameter
        // not belong to the currently logged in user, even if they do not exist.
        case 'AccessDeniedException': {
          throw new NotFoundException
        }
        default: {
          throw err
        }
      }
    }
  }
}
