import React from 'react'
import { Auth } from 'aws-amplify'
import { useIdleTimer } from 'react-idle-timer'
import { AlertDialog } from './alert-dialog'
import Button from '@mui/material/Button'
import CancelIcon from '@mui/icons-material/Cancel'
import { LogoutIcon } from '../icons/logout_icon'
import LinearProgress from '@mui/material/LinearProgress'

export function IdleAlertDialog (): JSX.Element {
  const timeoutSeconds = 240
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
