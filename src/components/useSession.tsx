import React from 'react'
import { Auth, Hub} from 'aws-amplify'
import { HubCallback } from '@aws-amplify/core/lib/Hub'
import { useAuthenticator } from '@aws-amplify/ui-react'

export default function useSession() {
  const { user, signOut } = useAuthenticator((context) => [context.user])

  // Listen to Amplify events with Amplify Hub
  React.useEffect(() => {
    const listener: HubCallback = ({ payload: { event, data } }) => {
      // https://docs.amplify.aws/lib/auth/auth-events/q/platform/js/
      switch (event) {
        case 'tokenRefresh_failure':
          signOut()
          break
      }
    }
    Hub.listen('auth', listener)

    // Stop listening when no longer needed
    return (): void => Hub.remove('auth', listener)
  }, [])

  /**
   * Changes the password for the currently authenticated user
   * 
   * @return {Promise<void>}
   */
  const changePassword = async function (currentPassword: string, newPassword: string): Promise<void> {
    await Auth.changePassword(user, currentPassword, newPassword)
  }

  return { user, signOut, changePassword }
}
