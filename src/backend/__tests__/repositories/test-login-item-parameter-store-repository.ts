import AWS from 'aws-sdk'
import { LoginItemParameterStoreRepository } from '../../repositories/login/login-item-parameter-store-repository'
import { getCognitoIdentityId, getCognitoIdentityUUID, getCognitoIdentityRegion } from '../../lib/aws/aws-cognito-federated-identity'
import { LoginItem, LoginItemDecryptedData } from '../../models/login/login-item'
import { logger } from '../../lib/logger/logger'
import { NotFoundException } from '../../errors/exceptions'
import { ENCRYPTION_PASSPHRASE, encrypt, isBase64, getIdFromParameter, ParameterNotFound, ParameterVersionNotFound } from '../utils/utils'

const region = 'eu-central-1'
const identityUUID = 'b184a1e4-5327-49fb-9030-eeee3f8a5d14'

const parameterValues: LoginItemDecryptedData[] = [
  {
    title: 'myTitle',
    path: 'myPath',
    username: 'myUsername',
    secret: 'mySecret'
  },
  {
    title: 'myTitle2',
    path: 'myPath2',
    username: 'myUsername2',
    secret: 'mySecret2'
  }
]

const parameters: AWS.SSM.Parameter[] = [
  {
    Name: `/sm/${identityUUID}/logins/TWOD0FCXdBFGOVUXVgdq1`,
    Type: 'String',
    Value: encrypt(parameterValues[0]),
    Version: 1,
    Selector: '1',
    LastModifiedDate: new Date(),
    ARN: `arn:aws:ssm:eu-central-1:123456789012:parameter/sm/${identityUUID}/logins/TWOD0FCXdBFGOVUXVgdq1`,
    DataType: 'text'
  },
  {
    Name: `/sm/${identityUUID}/logins/yLUrmWUTGOjIv0eKxA6mG`,
    Type: 'String',
    Value: encrypt(parameterValues[1]),
    Version: 1,
    Selector: '1',
    LastModifiedDate: new Date(),
    ARN: `arn:aws:ssm:eu-central-1:123456789012:parameter/sm/${identityUUID}/logins/yLUrmWUTGOjIv0eKxA6mG`,
    DataType: 'text'
  }
]

/**
 * Setup mocks with default implementation
 * 
 * @param {any} mockOverrides - Override mock implementations
 */
const setupMocks = (mockOverrides?: any): Array<any> => {
  // @ts-ignore
  AWS.SSM = jest.fn().mockImplementation(() => ({
    putParameter: putParameterPromise,
    getParameter: getParameterPromise,
    getParametersByPath: getParametersByPathPromise,
    deleteParameter: deleteParameterPromise,
    ...mockOverrides
  }))

  // @ts-ignore
  getCognitoIdentityId = jest.fn().mockReturnValue(`${region}:${identityUUID}`)
  // @ts-ignore
  getCognitoIdentityUUID = jest.fn().mockReturnValue(identityUUID)
  // @ts-ignore
  getCognitoIdentityRegion = jest.fn().mockReturnValue(region)

  const ssmClient = new AWS.SSM({
    apiVersion: '2014-11-06'
  })
  const repo = new LoginItemParameterStoreRepository(ssmClient)

  return [ repo ]
}

/**
 * AWS SSM putParameter response mock
 */
const putParameterPromise = jest.fn().mockReturnValue({
  promise: jest.fn().mockResolvedValue({
    Version: 1,
    Tier: 'Standard'
  })
})

/**
 * AWS SSM getParameter response mock
 */
const getParameterPromise = jest.fn().mockReturnValue({
  promise: jest.fn().mockResolvedValue({
    Parameter: parameters[0]
  })
})

/**
 * AWS SSM getParametersByPath response mock
 */
const getParametersByPathPromise = jest.fn().mockReturnValue({
  promise: jest.fn().mockResolvedValue({
    NextToken: "",
    Parameters: parameters
  })
})

/**
 * AWS SSM deleteParameter response mock
 */
const deleteParameterPromise = jest.fn().mockReturnValue({
  promise: jest.fn()
})

const loggerLog = logger.log
beforeAll(() => {
  process.env.ENCRYPTION_PASSPHRASE = ENCRYPTION_PASSPHRASE
  logger.log = jest.fn()
})

afterAll(() => {
  process.env.ENCRYPTION_PASSPHRASE = ''
  logger.log = loggerLog
})

afterEach(() => {    
  jest.clearAllMocks()
})

describe('login item ParameterStore repository', () => {
  const [ repo ] = setupMocks()

  it('should create item', async () => {
    const parameterValue = parameterValues[0]

    const response = await repo.create(
      parameterValue.title,
      parameterValue.path,
      parameterValue.username,
      parameterValue.secret
    )

    // Validate response
    // Id is autogenerated, should always be 21 chars
    expect(response.id.length).toBe(21)
    // Version should always be 1 on creation
    expect(response.version).toBe(1)
    // Check item creation date but ignore the exact time
    expect(response.lastModifiedDate.toTimeString()).toBe(new Date().toTimeString())
    // Encrypted data should be valid base64 encoded
    expect(isBase64(response.encryptedData)).toBe(true)
    // Ensure decrypted data corresponds to item values
    expect(response.getDecryptedData()).toStrictEqual(parameterValue)

    // Validate underlying functions called correctly
    const params: AWS.SSM.Types.PutParameterRequest = {
      Name: `/sm/${identityUUID}/logins/${response.id}`,
      Value: response.encryptedData,
      Type: 'String',
      Overwrite: false,
      Tags: [
        {
          Key: 'identityId',
          Value: `${region}:${identityUUID}`
        },
        {
          Key: 'type',
          Value: 'logins'
        }
      ]
    }
    expect(putParameterPromise).toHaveBeenCalledWith(params)
  })
  it('should get item', async () => {
    const parameter = parameters[0]
    const parameterValue = parameterValues[0]
    const id = getIdFromParameter(parameter)
    const response = await repo.get(id)

    // Validate response
    const expected = new LoginItem({
      id: getIdFromParameter(parameter),
      version: parameter.Version as number,
      lastModifiedDate: parameter.LastModifiedDate as Date,
      encryptedData: parameter.Value as string
    })
    expect(response).toStrictEqual(expected)

    // Ensure data can be decrypted
    expect(response.getDecryptedData()).toStrictEqual(parameterValue)

    // Validate underlying functions called correctly
    const params: AWS.SSM.Types.GetParameterRequest = {
      Name: `/sm/${identityUUID}/logins/${id}`
    }
    expect(getParameterPromise).toHaveBeenCalledWith(params)
  })
  it('should get item with specific version', async () => {
    const parameter = parameters[0]
    const parameterValue = parameterValues[0]
    const id = getIdFromParameter(parameter)
    const version = 1
    const response = await repo.get(id, version)

    // Validate response
    const expected = new LoginItem({
      id: getIdFromParameter(parameter),
      version: parameter.Version as number,
      lastModifiedDate: parameter.LastModifiedDate as Date,
      encryptedData: parameter.Value as string
    })
    expect(response).toStrictEqual(expected)

    // Ensure data can be decrypted
    expect(response.getDecryptedData()).toStrictEqual(parameterValue)

    // Validate underlying functions called correctly
    const params: AWS.SSM.Types.GetParameterRequest = {
      Name: `/sm/${identityUUID}/logins/${id}:${version}`
    }
    expect(getParameterPromise).toHaveBeenCalledWith(params)
  })
  it('should throw NotFoundException on get non-existent item', async () => {
    const [ repo ] = setupMocks({ getParameter: jest.fn().mockReturnValue({
      promise: jest.fn().mockImplementation(() => {
        throw new ParameterNotFound
      })
    })})

    await expect(() => repo.get('nonExistentId'))
      .rejects.toThrow(NotFoundException)
  })
  it('should throw NotFoundException on get non-existent item version', async () => {
    const [ repo ] = setupMocks({ getParameter: jest.fn().mockReturnValue({
      promise: jest.fn().mockImplementation(() => {
        throw new ParameterVersionNotFound
      })
    })})

    await expect(() => repo.get('nonExistentId'))
      .rejects.toThrow(NotFoundException)
  })
  it('should list items', async () => {
    const response = await repo.list()

    // Validate response
    const expected: LoginItem[] = parameters.map(item => {
      return new LoginItem({
        id: item.Name?.substr(item.Name?.lastIndexOf('/') + 1) || '',
        version: item.Version as number,
        lastModifiedDate: item.LastModifiedDate as Date,
        encryptedData: item.Value as string
      })
    })
    expect(response).toStrictEqual(expected)

    // Ensure data can be decrypted
    for (let i=0; i<response.length; i++) {
      expect(response[i].getDecryptedData()).toStrictEqual(parameterValues[i])
    }

    // Validate underlying functions called correctly
    const params: AWS.SSM.Types.GetParametersByPathRequest = {
      Path: `/sm/${identityUUID}/logins/`,
      Recursive: true
    }
    expect(getParametersByPathPromise).toHaveBeenCalledWith(params)
  })
  it('should update item', async () => {
    const parameter = parameters[0]
    const id = getIdFromParameter(parameter)

    const newParameterValue = {
      title: 'newTitle',
      path: 'newPath',
      username: 'newUsername',
      secret: 'newSecret'
    }

    const response = await repo.update(
      id,
      newParameterValue.title,
      newParameterValue.path,
      newParameterValue.username,
      newParameterValue.secret
    )

    // Validate response
    // Id should not be changed
    expect(response.id).toBe(id)
    // Version should increase by 1
    expect(response.version).toBe(parameter.Version as number + 1)
    // Check item creation date but ignore the exact time
    expect(response.lastModifiedDate.toTimeString()).toBe(new Date().toTimeString())
    // Encrypted data should be valid base64 encoded
    expect(isBase64(response.encryptedData)).toBe(true)
    // Ensure decrypted data corresponds to the new item values
    expect(response.getDecryptedData()).toStrictEqual(newParameterValue)

    // Validate underlying functions called correctly
    const params: AWS.SSM.Types.PutParameterRequest = {
      Name: `/sm/${identityUUID}/logins/${response.id}`,
      Value: response.encryptedData,
      Type: 'String',
      Overwrite: true,
      Tags: []
    }
    expect(putParameterPromise).toHaveBeenCalledWith(params)
  })
  it('should not update item when providing same values', async () => {
    const parameterValue = parameterValues[0]
    const parameter = parameters[0]
    const id = getIdFromParameter(parameter)

    const response = await repo.update(
      id,
      parameterValue.title,
      parameterValue.path,
      parameterValue.username,
      parameterValue.secret
    )

    // Validate response
    const expected = new LoginItem({
      id: id,
      version: parameter.Version as number,
      lastModifiedDate: parameter.LastModifiedDate as Date,
      encryptedData: parameter.Value as string
    })
    // Item should not be updated when providing same values
    expect(response).toStrictEqual(expected)

    // Put operation should not be called when providing same values
    expect(putParameterPromise).not.toHaveBeenCalled()
  })
  it('should throw NotFoundException on update non-existent item', async () => {
    const [ repo ] = setupMocks({ putParameter: jest.fn().mockReturnValue({
      promise: jest.fn().mockImplementation(() => {
        throw new ParameterNotFound
      })
    })})

    await expect(() => repo.update('nonExistentId', 'newTitle'))
      .rejects.toThrow(NotFoundException)
  })
  it('should delete item', async () => {
    const parameter = parameters[0]
    const id = getIdFromParameter(parameter)
    await repo.delete(id)

    // Validate underlying functions called correctly
    const params: AWS.SSM.Types.GetParameterRequest = {
      Name: `/sm/${identityUUID}/logins/${id}`
    }
    expect(deleteParameterPromise).toHaveBeenCalledWith(params)
  })
  it('should throw NotFoundException on delete non-existent item', async () => {
    const [ repo ] = setupMocks({ deleteParameter: jest.fn().mockReturnValue({
      promise: jest.fn().mockImplementation(() => {
        throw new ParameterNotFound
      })
    })})

    await expect(() => repo.delete('nonExistentId'))
      .rejects.toThrow(NotFoundException)
  })
})
