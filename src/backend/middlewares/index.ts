import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { authMiddleware } from "./auth/auth";
import { validateMiddleware } from "./validate/validate";

// List containing all middleware functions
const MIDDLEWARES = [authMiddleware, validateMiddleware];

/**
 * function to execute middlewares before handling a request
 *
 * @param {NextApiHandler} handler - Next `API` route handler
 * @return {Promise<void>}
 */
export function withMiddleware(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    for (const middleware of MIDDLEWARES) {
      await middleware(req, res);
      /**
       * Stop further execution if a middleware has set a response
       * @see https://nodejs.org/api/http.html#http_response_writableended
       */
      if (res.writableEnded) return;
    }

    return handler(req, res);
  };
}
