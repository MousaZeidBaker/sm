import React from 'react'
import { Auth, Hub } from 'aws-amplify'
import { HubCallback } from '@aws-amplify/core/lib/Hub'
import { Amplify } from 'aws-amplify'

Amplify.configure({
  ssr: true,
  'aws_project_region': process.env.NEXT_PUBLIC_APP_AWS_REGION,
  'aws_cognito_identity_pool_id': process.env.NEXT_PUBLIC_IDENTITY_POOL_ID,
  'aws_cognito_region': process.env.NEXT_PUBLIC_APP_AWS_REGION,
  'aws_user_pools_id': process.env.NEXT_PUBLIC_APP_USER_POOL_ID,
  'aws_user_pools_web_client_id': process.env.NEXT_PUBLIC_APP_USER_POOL_WEB_CLIENT_ID,
  'oauth': {}
})
// Amplify.Logger.LOG_LEVEL = 'DEBUG'

export interface User {
  username: string,
  attributes: {
    sub: string
    email_verified: boolean
    email: string
  }
}

export interface Session {
  user: User
  idToken: string
}

export default function useSession() {
  const [session, setSession] = React.useState<null | Session>(null)

  // Set session state based on the event
  const authListener: HubCallback = ({ payload: { event, data } }) => {
    switch (event) {
      case 'signIn': {
        setSession({
          user: {
            username: data.username,
            attributes: data.attributes
          },
          idToken: data.signInUserSession.idToken.jwtToken
        })
        break
      }
      case 'signOut': {
        setSession(null)
        break
      }
    }
  }

  // Start Amplify auth listener
  React.useEffect(() => {
    Hub.listen('auth', authListener)
    return () => Hub.remove('auth', authListener)
  }, [])

  // Check and set user session on page refresh if still valid
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await Auth.currentSession()
        const userInfo = await Auth.currentUserInfo()
        setSession({
          user: {
            username: userInfo.username,
            attributes: userInfo.attributes
          },
          idToken: session.getIdToken().getJwtToken()
        })
      } catch (err) {
        await signOut()
      }
    }
    fetchData()
  }, [])

  // Run in interval to check if session is still valid, sign out if not
  React.useEffect(() => {
    const ms = 600000 // 10 minutes

    const interval = setInterval(async () => {
      // If there is no current session, then there is nothing to check
      if (!session) return

      // Check if session is still valid, sing out if not
      try {
        await Auth.currentSession()
      } catch (err) {
        await signOut()
      }
    }, ms)
    return () => clearInterval(interval)
  }, [session])

  /**
   * Signs out the currently authenticated user
   * 
   * @return {Promise<void>}
   */
  const signOut = async function (): Promise<void> {
    await Auth.signOut()
  }

  /**
   * Changes the password for the currently authenticated user
   * 
   * @return {Promise<void>}
   */
  const changePassword = async function (currentPassword: string, newPassword: string): Promise<void> {
    const user = await Auth.currentAuthenticatedUser()
    await Auth.changePassword(user, currentPassword, newPassword)
  }

  return { session, signOut, changePassword }
}
