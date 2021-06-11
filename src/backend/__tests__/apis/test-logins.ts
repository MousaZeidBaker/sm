import AWS from 'aws-sdk'
import { logger } from '../../lib/logger/logger'
import { NotFoundException } from '../../errors/exceptions'
import { ENCRYPTION_PASSPHRASE, encrypt, isBase64, getIdFromParameter, ParameterNotFound, ParameterVersionNotFound } from '../utils/utils'
import { testClient } from '../utils/testClient'
import { region, identityUUID } from '../fixtures/cognito-identity'
import handler from '../../../pages/api/v1.0/logins/index'
import {  } from '../../lib/aws/aws-service-clients'

jest.mock('../../middlewares/auth/auth', () => ({
  authMiddleware: jest.fn()
}))
// jest.doMock('../../middlewares/auth/auth', () => ({
//   authMiddleware: jest.fn()
// }))

jest.mock('../../middlewares/validate/validate', () => ({
  validateMiddleware: jest.fn()
}))

jest.mock('../../lib/aws/aws-cognito-federated-identity', () => ({
  getCognitoIdentityId: jest.fn().mockReturnValue(`${region}:${identityUUID}`),
  getCognitoIdentityUUID: jest.fn().mockReturnValue(identityUUID),
  getCognitoIdentityRegion: jest.fn().mockReturnValue(region)
}))

jest.mock('../../lib/aws/aws-service-clients', () => {
  // Require the original module to not be mocked...
  const originalModule = jest.requireActual('../../lib/aws/aws-service-clients')

  const { parameters  } = jest.requireActual('../fixtures/login-item')

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
      NextToken: '',
      Parameters: parameters
    })
  })

  /**
   * AWS SSM deleteParameter response mock
   */
  const deleteParameterPromise = jest.fn().mockReturnValue({
    promise: jest.fn()
  })

  // @ts-ignore
  AWS.SSM = jest.fn().mockImplementation(() => ({
    putParameter: putParameterPromise,
    getParameter: getParameterPromise,
    getParametersByPath: getParametersByPathPromise,
    deleteParameter: deleteParameterPromise,
  }))

  const ssmClient = new AWS.SSM({
    apiVersion: '2014-11-06'
  })

  return {
    __esModule: true,
    ...originalModule,
    createAwsServiceClients: jest.fn().mockReturnValue(ssmClient)
  }
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





describe('/ handler', () => {
  it('responds 200 to authorized GET', async () => {
    const client = await testClient(handler)
    const response = await client.get('/')
    expect(response.status).toBe(200)
  })
  it.only('responds 401 to unauthorized GET', async () => {
    jest.doMock('../../middlewares/auth/auth', () => {
      // Require the original module to not be mocked...
      const originalModule = jest.requireActual('../../middlewares/auth/auth')

      return {
        __esModule: true,
        ...originalModule,
        verifyToken: jest.fn().mockReturnValue(false)
      }
    })

    const client = await testClient(handler)
    const response = await client.get('/')
    expect(response.status).toBe(401)
  })
})

// describe('login item ParameterStore repository', () => {
//   const [ repo ] = setupMocks()

//   it('should get item', async () => {
//     const parameter = parameters[0]
//     const parameterValue = parameterValues[0]
//     const id = getIdFromParameter(parameter)
//     const response = await repo.get(id)

//     // Validate response
//     const expected = new LoginItem({
//       id: getIdFromParameter(parameter),
//       version: parameter.Version as number,
//       lastModifiedDate: parameter.LastModifiedDate as Date,
//       encryptedData: parameter.Value as string
//     })
//     expect(response).toStrictEqual(expected)

//     // Ensure data can be decrypted
//     expect(response.getDecryptedData()).toStrictEqual(parameterValue)

//     // Validate underlying functions called correctly
//     const params: AWS.SSM.Types.GetParameterRequest = {
//       Name: `/sm/${identityUUID}/logins/${id}`
//     }
//     expect(getParameterPromise).toHaveBeenCalledWith(params)
//   })
// })
