import SSM from 'aws-sdk/clients/ssm'
import { encrypt } from '../utils/utils'
import { identityUUID } from './cognito-identity'
import { LoginItemDecryptedData } from '../../models/login/login-item'

export const parameterValues: LoginItemDecryptedData[] = [
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

export const parameters: SSM.Parameter[] = [
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
