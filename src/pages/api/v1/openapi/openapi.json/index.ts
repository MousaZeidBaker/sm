import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import openApi from "./openapi.json";

const account = process.env.NEXT_PUBLIC_APP_AWS_ACCOUNT;
const region = process.env.NEXT_PUBLIC_APP_AWS_REGION;
const userPoolId = process.env.NEXT_PUBLIC_APP_USER_POOL_ID;

/**
 * API route handler
 *
 * @param {NextApiRequest} req - The Next `API` route request
 * @param {NextApiResponse} res - The Next `API` route response
 * @return {Promise<void>}
 */
const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET": {
      openApi.components.securitySchemes.CognitoUserPool[
        "x-amazon-apigateway-authorizer"
      ].providerARNs = [
        `arn:aws:cognito-idp:${region}:${account}:userpool/${userPoolId}`
      ];
      res.status(200).json(openApi);
      return;
    }
    default: {
      res.setHeader("Allow", ["GET"]);
      res.status(415).json({
        errors: [
          {
            status: 415,
            title: "Method Not Allowed",
            detail: "Method Not Allowed"
          }
        ]
      });
      return;
    }
  }
};

export default handler;
