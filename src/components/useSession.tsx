import React from 'react'
import { Auth, Hub} from 'aws-amplify'
import { HubCallback } from '@aws-amplify/core/lib/Hub'
import { useAuthenticator } from '@aws-amplify/ui-react'
import { useIdleTimer } from 'react-idle-timer'
import { AlertDialog } from './alert-dialog'
import Button from '@mui/material/Button'
import CancelIcon from '@mui/icons-material/Cancel'
import { LogoutIcon } from '../icons/logout_icon'
import LinearProgress from '@mui/material/LinearProgress'

export default function useSession() {
  const { user, signOut } = useAuthenticator((context) => [context.user])

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

/**
 * Setup Amplify event listener
 * 
 * @return void
 */
export function setupAmplifyListener() {
  // Listen to Amplify events with Amplify Hub
  React.useEffect(() => {
    const listener: HubCallback = ({ payload: { event } }) => {
      // https://docs.amplify.aws/lib/auth/auth-events/q/platform/js/
      switch (event) {
        case 'tokenRefresh_failure':
          Auth.signOut()
          break
      }
    }
    Hub.listen('auth', listener)

    // Cleanup function, stop listener
    return (): void => Hub.remove('auth', listener)
  }, [])
}

export function IdleAlertDialog (): JSX.Element {
  const timeoutSeconds = 300
  const promptTimeoutSeconds = 30
  const progressStep = Math.round(100 / promptTimeoutSeconds)
  const [openAlertDialog, setOpenAlertDialog] = React.useState(false)
  const [remainingSeconds, setRemainingSeconds] = React.useState(promptTimeoutSeconds)
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
   * @return {Promise<void>}
   */
  const handleSignOut = async (): Promise<void> => {
    setOpenAlertDialog(false)
    await Auth.signOut()
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
