import SSM from 'aws-sdk/clients/ssm'
import { logger } from '../../logger/logger'

/**
 * @param {SSM} ssmClient - The AWS SSM service client 
 * @param {string} path - The complete hierarchy of the parameter
 * @return {Promise<SSM.Types.DeleteParameterResult>}
 */
export const deleteParameter = async (
  ssmClient: SSM,
  path: string,
): Promise<SSM.Types.DeleteParameterResult> => {
  // Request
  const params: SSM.Types.DeleteParameterRequest = {
    Name: path,
  }
  logger.info('Parameter Store DeleteParameter Request:', { params })

  // Response
  const response = await ssmClient.deleteParameter(params).promise()
  logger.info('Parameter Store response:', { response })

  return response
}
