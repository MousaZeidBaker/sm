import SSM from 'aws-sdk/clients/ssm'
import CryptoJS from 'crypto-js'

export const ENCRYPTION_PASSPHRASE = 'dKZwnz999y3t4lPsMjH9j4ZI/d1E8mScXWlS8uIWSGMuA1hO'

/**
 * Helper function that encrypts data
 * 
 * @param {{[key: string]: string}} data - The data to encrypt
 * @return {string} - The encrypted data
 */
export function encrypt(data: {[key: string]: any}): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_PASSPHRASE).toString()
}

/**
 * Helper function that validates weather a string is a valid base64 encoded
 * 
 * @param {string} str - The string to validate
 * @return {boolean} - True if string is valid base64 encoded, False otherwise
 */
export function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str
  } catch (err) {
    return false
  }
}

/**
 * Helper function that extracts the id from an SSM paramter name
 * 
 * @param {SSM.Parameter} parameter - The parameter to extract id from
 * @return {string} - The id of the paramter
 */
export function getIdFromParameter(parameter: SSM.Parameter): string {
  // The name have the following format: '/sm/<identityUUID>/logins/<id>'
  return parameter.Name?.substr(parameter.Name?.lastIndexOf('/') + 1) || ''
}

/**
 * Custom exception
 */
 export class ParameterNotFound extends Error {
  name: string

  constructor() {
    super()
    this.name = 'ParameterNotFound'

    // Needed for extending built-ins 
    // See: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ParameterNotFound.prototype)
  }
}

/**
 * Custom exception
 */
 export class ParameterVersionNotFound extends Error {
  name: string

  constructor() {
    super()
    this.name = 'ParameterVersionNotFound'

    // Needed for extending built-ins 
    // See: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ParameterVersionNotFound.prototype)
  }
}