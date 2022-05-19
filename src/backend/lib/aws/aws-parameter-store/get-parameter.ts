import SSM from "aws-sdk/clients/ssm";

import { logger } from "../../logger/logger";

/**
 * @param {SSM} ssmClient - The AWS SSM service client
 * @param {string} name - The complete hierarchy of the parameter
 * @return {Promise<SSM.Types.GetParameterResult>} The parameter
 */
export const getParameter = async (
  ssmClient: SSM,
  name: string
): Promise<SSM.Types.GetParameterResult> => {
  // Request
  const params: SSM.Types.GetParameterRequest = {
    Name: name
  };
  logger.info("Parameter Store GetParameter Request:", { params });

  // Response
  const response = await ssmClient.getParameter(params).promise();
  logger.info("Parameter Store response:", { response });

  return response;
};
