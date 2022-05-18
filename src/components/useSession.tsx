import React from 'react'
import { Amplify, Auth, Hub } from 'aws-amplify'
import { useAuthenticator } from '@aws-amplify/ui-react'
import { HubCallback } from '@aws-amplify/core/lib/Hub'
import { useIdleTimer } from 'react-idle-timer'
import { AlertDialog } from './alert-dialog'
import Button from '@mui/material/Button'
import CancelIcon from '@mui/icons-material/Cancel'
import { LogoutIcon } from '../icons/logout_icon'
import LinearProgress from '@mui/material/LinearProgress'

Amplify.configure({
  ssr: true,
  'aws_project_region': process.env.NEXT_PUBLIC_APP_AWS_REGION,
  'aws_cognito_identity_pool_id': process.env.NEXT_PUBLIC_APP_IDENTITY_POOL_ID,
  'aws_cognito_region': process.env.NEXT_PUBLIC_APP_AWS_REGION,
  'aws_user_pools_id': process.env.NEXT_PUBLIC_APP_USER_POOL_ID,
  'aws_user_pools_web_client_id': process.env.NEXT_PUBLIC_APP_USER_POOL_WEB_CLIENT_ID,
  'oauth': {}
})
// Amplify.Logger.LOG_LEVEL = 'DEBUG'

export default function useSession() {
  const { user, authStatus } = useAuthenticator(context => [context.user, context.authStatus])
  const [session, setSession] = React.useState(user.getSignInUserSession())

  // Listen to Amplify events with Amplify Hub on component mount
  React.useEffect(() => {
    const listener: HubCallback = ({ payload: { event } }) => {
      // https://docs.amplify.aws/lib/auth/auth-events/q/platform/js/
      switch (event) {
        case 'tokenRefresh_failure':
          signOut()
          break
      }
    }
    Hub.listen('auth', listener)

    // Cleanup function, stop listener
    return (): void => Hub.remove('auth', listener)
  }, [])

  /**
   * Return idToken for current authenticated user, attempt to refresh if
   * invalid, sign out if refreshToken invalid
   * 
   * @return {string}
   */
  async function getIdToken(): Promise<string> {
    let idToken = session?.getIdToken().getJwtToken() || ''

    if (!session?.isValid()) {
      // Invalid session, refresh it
      try {
        // Auth.currentSession() will automatically refresh the accessToken and
        // idToken if tokens are expired and a valid refreshToken presented
        // https://docs.amplify.aws/lib/auth/manageusers/q/platform/js/#retrieve-current-session

        const freshSession = await Auth.currentSession()
        setSession(freshSession)
        idToken = freshSession?.getIdToken().getJwtToken()
      } catch {
        signOut()
      }
    }

    return idToken
  }

  /**
   * Sign out current authenticated user
   * 
   * @return {void}
   */
  function signOut(): void {
    setSession(null)
    Auth.signOut()
  }

  /**
   * Change password for current authenticated user
   * 
   * @return {Promise<void>}
   */
  const changePassword = async function (currentPassword: string, newPassword: string): Promise<void> {
    await Auth.changePassword(user, currentPassword, newPassword)
  }

  return { user, authStatus, getIdToken, signOut, changePassword }
}

export function IdleAlertDialog (): JSX.Element {
  const timeoutSeconds = 300
  const promptTimeoutSeconds = 30
  const progressStep = Math.round(100 / promptTimeoutSeconds)
  const [openAlertDialog, setOpenAlertDialog] = React.useState(false)
  const [remainingSeconds, setRemainingSeconds] = React.useState(0)
  const [progress, setProgress] = React.useState(progressStep)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prevRemaining) => (
        prevRemaining <= 0 ? prevRemaining : prevRemaining - 1
      ))
      setProgress((prevProgress) => (
        prevProgress >= 100 ? prevProgress : prevProgress + progressStep
      ))
    }, 1000)

    return () => clearInterval(interval)
  }, [remainingSeconds])

  /**
   * This function fires when timeout is reached
   * 
   * @return void
   */
  const onPrompt = () => {
    setOpenAlertDialog(true)
    setRemainingSeconds(promptTimeoutSeconds)
    setProgress(progressStep)
  }

  /**
   * This function fires when user becomes idle (when prompt timeout is reached)
   * 
   * @return void
   */
  const onIdle = () => {
    handleSignOut()
  }

  // Create timer
  const idleTimer = useIdleTimer({
    timeout: timeoutSeconds * 1000,
    promptTimeout: promptTimeoutSeconds * 1000,
    onIdle: onIdle,
    onPrompt: onPrompt,
  })

  /**
   * Handles cancel event
   * 
   * @return {void}
   */
  const handleCancel = (): void => {
    setOpenAlertDialog(false)
    idleTimer.reset()
  }

  /**
   * Handles sign out event
   * 
   * @return {void}
   */
  const handleSignOut = (): void => {
    setOpenAlertDialog(false)
    Auth.signOut()
  }

  return (
    <>
      <AlertDialog
        open={openAlertDialog}
        title="Are you still there?"
        content={
          `You are being timed out due to inactivity. Please choose to stay \
          or to sign out. Otherwise, you will automatically be signed out in \
          ${remainingSeconds} seconds.`
        }
        actions={
          <>
            <Button
              variant='contained'
              title='Cancel'
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              title='SignOut'
              startIcon={<LogoutIcon />}
              onClick={handleSignOut}
              color='secondary'
            >
              Sign out
            </Button>
          </>
        }
        progress={<LinearProgress variant="determinate" value={progress} />}
      />
    </>
  )
}
