import AWS from 'aws-sdk/global'

/**
 * Get the Cognito federated identity Id
 * 
 * @return {string} - The identity id in the following format 'region:uuid'
 */
 export function getCognitoIdentityId(): string {
  const credentials = AWS.config.credentials as AWS.CognitoIdentityCredentials
  return credentials.identityId
}

/**
 * Get the UUID of the Cognito federated identity Id
 */
 export function getCognitoIdentityUUID(): string {
  // The identity id is in the following format 'region:uuid'
  const [ region, uuid ] = getCognitoIdentityId().split(':')
  return uuid
}

/**
 * Get the region of the Cognito federated identity Id
 */
 export function getCognitoIdentityRegion(): string {
  // The identity id is in the following format 'region:uuid'
  const [ region, uuid ] = getCognitoIdentityId().split(':')
  return region
}
