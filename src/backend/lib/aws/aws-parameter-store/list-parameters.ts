import SSM from 'aws-sdk/clients/ssm'
import { logger } from '../../logger/logger'

/**
 * @param {SSM} ssmClient - The AWS SSM service client 
 * @param {string} path - The hierarchy of the parameter
 * @param {SSM.NextToken} [nextToken] - The token to start the list. Use this token to get the next set of results
 * @return {Promise<SSM.Types.GetParametersByPathResult>}
 */
async function getParametersByPath(
  ssmClient: SSM,
  path: string,
  nextToken?: SSM.NextToken
): Promise<SSM.Types.GetParametersByPathResult> {
  // Request
  const params: SSM.Types.GetParametersByPathRequest = {
    Path: path,
    Recursive: true
  }
  // Add NextToken if provided
  if (nextToken) params.NextToken = nextToken
  logger.info('Parameter Store GetParametersByPath Request:', { params })

  // Response
  const response = await ssmClient.getParametersByPath(params).promise()
  logger.info('Parameter Store response:', { response })

  return response
}

/**
 * @param {SSM} ssmClient - The AWS SSM service client 
 * @param {string} path - The hierarchy of the parameter
 * @param {SSM.NextToken} [nextToken] - The token to start the list. Use this token to get the next set of results
 * @return {Promise<SSM.Types.Parameter[]>}
 */
async function getParametersByPathRecursive(
  ssmClient: SSM,
  path: string,
  nextToken?: SSM.NextToken
): Promise<SSM.Parameter[]> {
  const response = await getParametersByPath(ssmClient, path, nextToken)
  const items: SSM.Parameter[] = response.Parameters || []

  // The base case
  if (!response.NextToken) return items

  // NextToken is present, continue with a subsequent operation
  const subResponse = await getParametersByPathRecursive(
    ssmClient,
    path,
    response.NextToken
  )

  return items.concat(subResponse)
}

/**
 * @param {SSM} ssmClient - The AWS SSM service client 
 * @param {SSM.ParameterNameList} names - A list of parameter names to retrieve
 * @return {Promise<SSM.Types.GetParametersByPathResult>}
 */
export async function getParameters(
  ssmClient: SSM,
  names: SSM.ParameterNameList,
): Promise<SSM.Types.GetParametersResult> {
  // Request
  const params: SSM.Types.GetParametersRequest = {
    Names: names
  }
  logger.info('Parameter Store GetParameters Request:', { params })

  // Response
  const response = await ssmClient.getParameters(params).promise()
  logger.info('Parameter Store response:', { response })

  return response
}
