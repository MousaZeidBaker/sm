import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { logger } from "../../../../backend/lib/logger/logger";
import { withMiddleware } from "../../../../backend/middlewares";
import { LoginItem } from "../../../../backend/models/login/login-item";
import { LoginItemApi } from "../../../../backend/models/login/login-item-api";
import { LoginItemParameterStoreRepository } from "../../../../backend/repositories/login/login-item-parameter-store-repository";
import { LoginItemRepository } from "../../../../backend/repositories/login/login-item-repository";

let repo: LoginItemRepository;

/**
 * Process a GET request
 *
 * @param {NextApiResponse} res - The Next `API` route response
 * @return {Promise<void>}
 */
async function get(res: NextApiResponse): Promise<void> {
  let items: LoginItem[];
  try {
    items = await repo.list();
  } catch (err: any) {
    logger.error("Error on list login items:", [err]);

    switch (err.name) {
      default: {
        res.status(500).json({
          errors: [
            {
              status: 500,
              title: "Internal Server Error",
              detail: "Internal Server Error"
            }
          ]
        });
        return;
      }
    }
  }

  const response: { data: LoginItemApi[] } = {
    data: items.map((item: LoginItem): LoginItemApi => {
      return {
        id: item.id,
        type: "logins",
        attributes: {
          version: item.version,
          lastModifiedDate: item.lastModifiedDate,
          ...item.getDecryptedData()
        }
      };
    })
  };
  res.status(200).json(response);
}

/**
 * Process a POST request
 *
 * @param {NextApiRequest} req - The Next `API` route request
 * @param {NextApiResponse} res - The Next `API` route response
 * @return {Promise<void>}
 */
async function post(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  let item: LoginItem;
  try {
    item = await repo.create(
      req?.body?.data?.attributes.title,
      req?.body?.data?.attributes.path,
      req?.body?.data?.attributes.username,
      req?.body?.data?.attributes.secret,
      req?.body?.data?.attributes.note
    );
  } catch (err: any) {
    logger.error("Error on create login item:", [err]);

    switch (err.name) {
      default: {
        res.status(500).json({
          errors: [
            {
              status: 500,
              title: "Internal Server Error",
              detail: "Internal Server Error"
            }
          ]
        });
        return;
      }
    }
  }

  const response: { data: LoginItemApi } = {
    data: {
      id: item.id,
      type: "logins",
      attributes: {
        version: item.version,
        lastModifiedDate: item.lastModifiedDate,
        ...item.getDecryptedData()
      }
    }
  };
  res.status(200).json(response);
}
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
  repo = await LoginItemParameterStoreRepository.build(
    req.headers.authorization || ""
  );

  switch (req.method) {
    case "GET": {
      await get(res);
      return;
    }
    case "POST": {
      await post(req, res);
      return;
    }
    default: {
      res.setHeader("Allow", ["GET", "POST"]);
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

export default withMiddleware(handler);
