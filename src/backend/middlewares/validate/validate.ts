import Joi, { Schema } from "joi";
import { NextApiRequest, NextApiResponse } from "next";

import { logger } from "../../lib/logger/logger";

const stringPattern = new RegExp(
  // eslint-disable-next-line no-useless-escape
  /^[a-zA-Z0-9!\"#$%&'()*+,-./:;<=>?@[\\\]\^_`{\|}~]{1,50}$/m
);

/**
 * Validation schema for login item attributes
 */
const loginItemAttributesSchema = Joi.object({
  title: Joi.string().min(1).max(50).pattern(stringPattern).required(),
  path: Joi.string()
    .min(1)
    .max(50)
    // Matches one depth, the following pattern matches two depths '/^(\/[a-zA-Z0-9]*)(\/[a-zA-Z0-9]+){0,1}/'
    .pattern(/^(\/[a-zA-Z0-9]*)/)
    .required(),
  username: Joi.string().min(1).max(50).pattern(stringPattern).required(),
  secret: Joi.string().min(1).max(50).pattern(stringPattern).required(),
  note: Joi.string().min(1).max(1000).required()
});

/**
 * Get Joi validation schema based on the API request
 *
 * @param {NextApiRequest} req - The Next `API` route request
 * @return {ObjectSchema}
 */
function getSchema(req: NextApiRequest): Schema {
  // Create a URL object with a dummy host since we are only interested in the path
  const url = new URL(req.url as string, "http://example.com");

  switch (true) {
    case url.pathname === "/api/v1.0/logins": {
      switch (req.method) {
        case "POST": {
          return Joi.object({
            data: {
              type: Joi.valid("logins").required(),
              attributes: loginItemAttributesSchema
            }
          }).options({ presence: "required" });
        }
        default: {
          return Joi.object();
        }
      }
    }
    case url.pathname.startsWith("/api/v1.0/logins/"): {
      switch (req.method) {
        case "PATCH": {
          return Joi.object({
            data: {
              type: Joi.valid("logins"),
              id: Joi.valid(req.query.id).messages({
                "any.only": '"data.id" must be equal to id in URL'
              }),
              attributes: loginItemAttributesSchema
            }
          }).options({ presence: "required" });
        }
        default: {
          return Joi.object();
        }
      }
    }
    default: {
      return Joi.object();
    }
  }
}

/**
 * Validate middleware
 *
 * @param {NextApiRequest} req - The Next `API` route request
 * @param {NextApiResponse} res - The Next `API` route response * @return {Promise<void>}
 */
export async function validateMiddleware(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const schema = getSchema(req);

  const { error } = schema.validate(req.body || {}, {
    abortEarly: false,
    convert: false
  });

  if (error) {
    logger.info("Validation error:", [error]);
    res.status(422).json({
      errors: error.details.map((item) => {
        return {
          status: "422",
          source: {
            pointer: `/${item.path.join("/")}`
          },
          detail: item.message
        };
      })
    });
  }

  if (res.writableEnded) return; // Return if response already set

  // Validate id if provided. All ids contains 21 alphanumeric characters,
  // return 404 on invalid id
  if (req.query.id) {
    const { error } = Joi.string().alphanum().length(21).validate(req.query.id);

    if (error) {
      logger.info("Validation error:", [error]);
      res.status(404).json({
        errors: [
          {
            status: 404,
            title: "Not Found",
            detail: "Not Found"
          }
        ]
      });
    }
  }
}
