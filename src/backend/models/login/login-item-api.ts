/**
 * The interface of the login item in API context
 */
 export interface LoginItemApi {
  id: string
  type: 'logins'
  attributes: {
    version: number
    lastModifiedDate: Date
    title: string
    path: string
    username: string
    secret: string
  }
}
