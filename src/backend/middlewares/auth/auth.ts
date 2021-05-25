import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import jwkToPem from 'jwk-to-pem'
import AWS from 'aws-sdk/global'
import { logger } from '../../lib/logger/logger'
import fs from 'fs'
import os from 'os'
import path from 'path'

const iss = `https://cognito-idp.${process.env.NEXT_PUBLIC_APP_AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_APP_USER_POOL_ID}`

const unauthorizedError = {
  errors: [
    {
      status: 401,
      title: 'Unauthorized',
      detail: 'Authentication failed'
    }
  ]
}

/**
 * Retrieve PEMs
 * 
 * Downloads the JSON Web Key Set (JWK Set) for our user pool and convert the keys to PEM format.
 * 
 * @return {Promise<{ [key: string]: string }>} The JWKs in PEM format
 */
async function getPems(): Promise<{ [key: string]: string }> {
  let pems: { [key: string]: string } = {}

  const filePath = path.resolve(os.tmpdir(), 'jwks.json')

  // Download file only if it does not exists
  if (!fs.existsSync(filePath)) {
    // Download JWKs for our user pool
    const response = await fetchWithLogging(`${iss}/.well-known/jwks.json`)
    if (response.status !== 200) {
      logger.error('Failed to retrieve PEMs')
      return {}
    }
    const jwks = await response.text()
    fs.writeFileSync(filePath, jwks)
  }

  const jwks = JSON.parse(fs.readFileSync(filePath, {encoding: 'utf8'}))

  // Convert each key to PEM format
  for (const key of jwks.keys) {
    const key_id = key.kid
    const modulus = key.n
    const exponent = key.e
    const key_type = key.kty
    const jwk = {
      kty: key_type,
      n: modulus,
      e: exponent
    }
  
    const pem = jwkToPem(jwk)
    pems[key_id] = pem
  }

  return pems
}

/**
 * Verifies JWT tokens
 * 
 * @param {string} token - The token to verify
 * 
 * @return {Promise<boolean>} True if valid, False otherwise
 */
async function verifyToken(token: string): Promise<boolean> {
  const pems = await getPems()

  const decodedJwt = jwt.decode(token, {
    complete: true,
    json: true
  })

  // Fail if the token is not JWT
  if (!decodedJwt) {
    logger.info('Not a valid JWT token')
    return false
  }

  // Fail if token is not from our user pool
  if (decodedJwt.payload.iss !== iss) {
    logger.info('Invalid issuer')
    return false
  }

  // Reject the JWT if it's not an ID token
  if (decodedJwt.payload.token_use !== 'id') {
    logger.info('Not an ID token')
    return false
  }

  // Get the kid from the token and retrieve corresponding PEM
  const kid = decodedJwt.header.kid
  const pem = pems[kid]
  if (!pem) {
    logger.info('PEM not found, invalid token')

    // Delete file contain JWKs in case file is not valid anymore, a new file
    // will be downloaded in the next request
    const filePath = path.resolve(os.tmpdir(), 'jwks.json')
    fs.unlink(filePath, (err) => {
      if (err) logger.info(`Could not delete file: ${filePath}`)
      // if no error, file has been deleted successfully
      logger.info(`Successfully deleted file: ${filePath}`)
    })
    return false
  }

  // Verify the signature of the JWT token to ensure it's really coming from our user pool
  let decoded
  try {
    decoded = jwt.verify(token, pem, { issuer: iss }) as {[key: string]: any}
  } catch (err) {
    logger.info('Could not to verify the signature of the JWT token', { err })
    return false
  }

  const now = new Date()
  const expiration = new Date(decoded['exp'] * 1000)
  if (expiration <= now) {
    logger.info(`Token expired at ${expiration.toUTCString()} while current date is ${now.toUTCString()}`)
    return false
  }

  logger.info('Signature of the JWT token successfully verified', { decoded })
  return true
}

/**
 * Fetch with logging
 * 
 * Wraps the fetch() method and prints logs
 * 
 * @param {RequestInfo} input - This defines the resource to fetch
 * @param {RequestInit} init - An object containing custom settings to apply to the request
 * 
 * @return {Promise<Response>}
 */
async function fetchWithLogging(input: RequestInfo, init?: RequestInit): Promise<Response> {
  logger.info('HTTPS request: ', { input, init })
  const response = await fetch(input, init)
  const clone = response.clone()
  logger.info('HTTPS response:', { ...[ clone.status, await clone.text() ] })
  return response
}

/**
 * Auth middleware
 * 
 * @param {NextApiRequest} req - The Next `API` route request
 * @param {NextApiResponse} res - The Next `API` route response
 * 
 * @return {Promise<void>}
 */
export async function authMiddleware(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const tokenVerified = await verifyToken(req.headers.authorization || '')
  if (!tokenVerified) {
    logger.info('Token authentication failed')
    res.status(401).json(unauthorizedError)
    return
  }

  const credentials = AWS.config.credentials as AWS.CognitoIdentityCredentials
  logger.info('IdentityId:', [ credentials.identityId ])
}
