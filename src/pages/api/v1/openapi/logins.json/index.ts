import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import logins from "./logins.json";

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
      res.status(200).json(logins);
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
