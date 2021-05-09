import STS from 'aws-sdk/clients/sts'
import { logger } from '../../logger/logger'

/**
 * Retrieve details about the IAM user or role whose credentials are used to
 * call the operation. This function can be used to verify AWS credentials
 * are properly set.
 * 
 * @param {STS} stsClient - The AWS STS service client 
 * @return {Promise<STS.GetCallerIdentityResponse>}
 */
  export const getCallerIdentity = async (stsClient: STS): Promise<STS.GetCallerIdentityResponse> => {
  logger.info('STS getCallerIdentity request')
  const callerIdentity = await stsClient.getCallerIdentity({}).promise()
  logger.info('STS getCallerIdentity response: ', { callerIdentity })
  return callerIdentity
}
