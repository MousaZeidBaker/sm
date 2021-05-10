import { getParameters } from '../../lib/aws/aws-parameter-store/list-parameters'
import { getResourcesRecursive } from '../../lib/aws/aws-resource-groups-tagging-api/get-resources'
import { getParameter } from '../../lib/aws/aws-parameter-store/get-parameter'
import { deleteParameter } from '../../lib/aws/aws-parameter-store/delete-parameter'
import { createParameter, updateParameter } from '../../lib/aws/aws-parameter-store/put-parameter'
import { LoginItem } from '../../models/login/login-item'
import { createAwsServiceClients, ServiceName } from '../../lib/aws/aws-service-clients'
import { getCognitoIdentityUUID, getCognitoIdentityId } from '../../lib/aws/aws-cognito-federated-identity'
import { NotFoundException } from '../../errors/exceptions'
import SSM from 'aws-sdk/clients/ssm'
import ResourceGroupsTaggingAPIClient from 'aws-sdk/clients/resourcegroupstaggingapi'
import { LoginItemRepository } from './login-item-repository'

export class LoginItemParameterStoreRepository implements LoginItemRepository {
  ssmClient: SSM
  resourceGroupsTaggingAPIClient: ResourceGroupsTaggingAPIClient

  constructor(ssmClient: SSM, resourceGroupsTaggingAPIClient: ResourceGroupsTaggingAPIClient) {
    this.ssmClient = ssmClient
    this.resourceGroupsTaggingAPIClient = resourceGroupsTaggingAPIClient
  }

  public static async build(idToken: string): Promise<LoginItemParameterStoreRepository> {
    const resourceGroupsTaggingAPIClient = await createAwsServiceClients(ServiceName.ResourceGroupsTaggingAPI, idToken)
    const ssmClient = await createAwsServiceClients(ServiceName.SSM, idToken)

    return new LoginItemParameterStoreRepository(ssmClient, resourceGroupsTaggingAPIClient)
  }

  public async create(title: string, path: string, username: string, secret: string): Promise<LoginItem> {
    const encryptedData = LoginItem.encryptData({
      title: title,
      path: path,
      username: username,
      secret: secret
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
          throw NotFoundException
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
    // Fetch ssm resources tagged with the identity id of the currently authenticated user. Note
    // the actual parameters are fetched in a subsequent request.
    const getResourcesResponse = await getResourcesRecursive(
      this.resourceGroupsTaggingAPIClient,
      [
        {
          Key: 'identityId',
          Values: [
            getCognitoIdentityId()
          ]
        },
        {
          Key: 'type',
          Values: [
            'logins'
          ]
        }
      ],
      [
        'ssm:parameter'
      ]
    )

    const paramterNames = getResourcesResponse.map(item => {
      // Extract paramter name from the ARN
      return item.ResourceARN?.substring(item.ResourceARN?.indexOf('/'))
    }) as string[]

    if (paramterNames.length == 0) return [] // No resources found

    const getParametersResponse = await getParameters(this.ssmClient, paramterNames)

    if (!getParametersResponse.Parameters) return [] // could not fetch any parameters

    // Return parameters
    return getParametersResponse.Parameters.map(item => {
      const id = item.Name?.substr(item.Name?.lastIndexOf('/') + 1) || ''

      return new LoginItem({
        id: id,
        version: item?.Version,
        lastModifiedDate: item?.LastModifiedDate,
        encryptedData: item?.Value as string
      })
    })
  }

  public async update(id: string, title?: string, path?: string, username?: string, secret?: string): Promise<LoginItem> {
    const oldItem = await this.get(id)

    const encryptedData = LoginItem.encryptData({
      title: title || '',
      path: path || '',
      username: username || '',
      secret: secret || ''
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
          throw NotFoundException
        }
        default: {
          throw err
        }
      }
    }
  }
}
