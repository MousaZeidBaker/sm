import SSM from "aws-sdk/clients/ssm";

import { logger } from "../../logger/logger";

/**
 * @param {SSM} ssmClient - The AWS SSM service client
 * @param {string} name - The complete hierarchy of the parameter
 * @param {string} value - The parameter value
 * @param {SSM.Tag[]} tags - Metadata tags to assign to the parameter
 * @param {boolean} overwrite - Indicates if an an existing parameter should be overwritten
 * @return {Promise<SSM.Types.PutParameterResult>}
 */
async function putParameter(
  ssmClient: SSM,
  name: string,
  value: string,
  tags: SSM.Tag[],
  overwrite: boolean
): Promise<SSM.Types.PutParameterResult> {
  // Request
  const params: SSM.Types.PutParameterRequest = {
    Name: name,
    Value: value,
    Type: "String",
    Overwrite: overwrite,
    Tags: tags
  };
  logger.info("Parameter Store PutParameter Request:", { params });

  // Response
  const response = await ssmClient.putParameter(params).promise();
  logger.info("Parameter Store response:", { response });

  return response;
}

/**
 * @param {SSM} ssmClient - The AWS SSM service client
 * @param {string} name - The complete hierarchy of the parameter
 * @param {string} value - The parameter value
 * @param {SSM.Tag[]} tags - Metadata tags to assign to the parameter
 * @return {Promise<SSM.Types.PutParameterResult>}
 */
export const createParameter = async (
  ssmClient: SSM,
  name: string,
  value: string,
  tags: SSM.Tag[]
): Promise<SSM.PutParameterResult> => {
  return await putParameter(ssmClient, name, value, tags, false);
};

/**
 * @param {SSM} ssmClient - The AWS SSM service client
 * @param {string} name - The complete hierarchy of the parameter
 * @param {string} value - The new parameter value
 * @return {Promise<SSM.Types.PutParameterResult>}
 */
export const updateParameter = async (
  ssmClient: SSM,
  name: string,
  value: string
): Promise<SSM.PutParameterResult> => {
  return await putParameter(ssmClient, name, value, [], true);
};
