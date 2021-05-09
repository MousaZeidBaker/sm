import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { LoginItem } from '../../../../backend/models/login/login-item'
import { withMiddleware } from '../../../../backend/middlewares'
import { LoginItemApi } from '../../../../backend/models/login/login-item-api'
import { logger } from '../../../../backend/lib/logger/logger'
import { MethodNotAllowedHttpResponse, NotFoundHttpResponse, InternalServerHttpResponse } from '../../../../backend/errors/http-errors'
import { NotFoundException } from '../../../../backend/errors/exceptions'
import { LoginItemParameterStoreRepository } from '../../../../backend/repositories/login/login-item-parameter-store-repository'
import { LoginItemRepository } from '../../../../backend/repositories/login/login-item-repository'

let repo: LoginItemRepository

/**
 * Process a GET request
 * 
 * @param {NextApiRequest} req - The Next `API` route request
 * @param {NextApiResponse} res - The Next `API` route response
 * @return {Promise<void>}
 */
async function getRequest (req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const id = req.query.id as string
  const version = parseInt(req.query.version as string)

  let item: LoginItem
  try {
    item = await repo.get(id, version)
  } catch (err) {
    logger.info('Failed to get login item:', [ err ])

    switch(err.constructor) {
      case NotFoundException: {
        res.status(404).json(NotFoundHttpResponse)
        return
      }
      default: {
        res.status(500).json(InternalServerHttpResponse)
        return
      }
    }
  }

  const response: { data: LoginItemApi } = {
    data: {
      id: item.id,
      type: 'logins',
      attributes: {
        version: item.version,
        lastModifiedDate: item.lastModifiedDate,
        ...item.getDecryptedData()
      }
    }
  }
  res.status(200).json(response)
}

/**
 * Process a PATCH request
 * 
 * @param {NextApiRequest} req - The Next `API` route request
 * @param {NextApiResponse} res - The Next `API` route response
 * @return {Promise<void>}
 */
async function patchRequest (req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const id = req.query.id as string

  let item: LoginItem
  try {
    item = await repo.update(
      id,
      req.body?.data?.attributes?.title,
      req.body?.data?.attributes?.path,
      req.body?.data?.attributes?.username,
      req.body?.data?.attributes?.secret
    )
  } catch (err) {
    logger.info('Failed to update login item:', [ err ])

    switch(err.constructor) {
      case NotFoundException: {
        res.status(404).json(NotFoundHttpResponse)
        return
      }
      default: {
        res.status(500).json(InternalServerHttpResponse)
        return
      }
    }
  }

  const response: { data: LoginItemApi } = {
    data: {
      id: item.id,
      type: 'logins',
      attributes: {
        version: item.version,
        lastModifiedDate: item.lastModifiedDate,
        ...item.getDecryptedData()
      }
    }
  }
  res.status(200).json(response)
}

/**
 * Process a DELETE request
 * 
 * @param {NextApiRequest} req - The Next `API` route request
 * @param {NextApiResponse} res - The Next `API` route response
 * @return {Promise<void>}
 */
async function deleteRequest (req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const id = req.query.id as string

  try {
    await repo.delete(id)
  } catch (err) {
    logger.info('Failed to delete login item:', [ err ])

    switch(err.constructor) {
      case NotFoundException: {
        res.status(404).json(NotFoundHttpResponse)
        return
      }
      default: {
        res.status(500).json(InternalServerHttpResponse)
        return
      }
    }
  }

  res.status(204).send('')
}

/**
 * API route handler
 * 
 * @param {NextApiRequest} req - The Next `API` route request
 * @param {NextApiResponse} res - The Next `API` route response
 * @return {Promise<void>}
 */
const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  repo = await LoginItemParameterStoreRepository.build(req.headers.authorization || '')

  switch(req.method) {
    case 'GET': {
      await getRequest(req, res)
      return
    }
    case 'PATCH': {
      await patchRequest(req, res)
      return
    }
    case 'DELETE': {
      await deleteRequest(req, res)
      return
    }
    default: {
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
      res.status(415).json(MethodNotAllowedHttpResponse)
      return
    }
  }
}

export default withMiddleware(handler)
