import { logger } from '../logger/logger'
import AWS from 'aws-sdk'

const identityProvider = `cognito-idp.${process.env.NEXT_PUBLIC_APP_AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_APP_USER_POOL_ID}`

export enum ServiceName {
  SSM = 'ssm',
  ResourceGroupsTaggingAPI = 'resourcegroupstaggingapi'
}

/**
 * Returns temporary AWS cognito identity credentials
 * 
 * @param {string} idToken - The id token
 * 
 * @return {AWS.CognitoIdentityCredentials}
 */
 function getCognitoIdentityCredentials(idToken: string): AWS.CognitoIdentityCredentials {
  return new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.NEXT_PUBLIC_APP_IDENTITY_POOL_ID as string,
    Logins: {
      [identityProvider]: idToken
    }
  })
}

/**
 * Creates AWS service clients
 * 
 * Client are configured with api version, region and credentials
 * 
 * @param {ServiceName} serviceName - The name of the service to create
 * @param {string} idToken - The id token
 * 
 * @return AWS service clients
 */
export async function createAwsServiceClients(serviceName: ServiceName.SSM, idToken: string): Promise<AWS.SSM>
export async function createAwsServiceClients(serviceName: ServiceName.ResourceGroupsTaggingAPI, idToken: string): Promise<AWS.ResourceGroupsTaggingAPI>
export async function createAwsServiceClients(serviceName: ServiceName, idToken: string): Promise<AWS.STS | AWS.SSM | AWS.ResourceGroupsTaggingAPI> {
  const credentials = getCognitoIdentityCredentials(idToken)

  // Configure AWS region and temporary credentials
  AWS.config.update({
    region: process.env.NEXT_PUBLIC_APP_AWS_REGION,
    credentials: credentials
  })

  try {
    // The following request makes the new credentials available
    const credentials = AWS.config.credentials as AWS.CognitoIdentityCredentials
    await credentials.getPromise()
  } catch (err) {
    const msg = 'Failed to configure temporary AWS credentials'
    logger.info(msg, { err })
    throw new Error(msg)
  }

  switch(serviceName) {
    case ServiceName.SSM: {
      return new AWS.SSM({
        apiVersion: '2014-11-06'
      })
    }
    case ServiceName.ResourceGroupsTaggingAPI: {
      return new AWS.ResourceGroupsTaggingAPI({
        apiVersion: '2017-01-26'
      })
    }
    default: {
      throw new Error('Invalid service name')
    }
  }
}
