import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import CancelIcon from '@material-ui/icons/Cancel'
import useSession from '../components/useSession'
import { useSnackbar } from 'notistack'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  id: string
  itemType: string
  handleDelete: () => void
}

export function DeleteItemAlertDialog(props: Props): JSX.Element {
  const { session } = useSession()
  const { enqueueSnackbar } = useSnackbar()

  /**
   * Handles close event
   * 
   * @return {void}
   */
  const handleClose = (): void => {
    props.setOpen(false)
  }

  /**
   * Handles delete event
   * 
   * @return {Promise<void>}
   */
  const handleDelete = async (): Promise<void> => {
    // Close dialog immediately, use snackbar to inform user about the process
    props.setOpen(false)
    enqueueSnackbar("Deleting item...", { variant: 'info' })

    // API request to delete item
    const response = await fetch(`/api/v1.0/${props.itemType}/${props.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': session?.idToken || '',
      }
    })

    // Show snackbar message
    if (response.status === 204) {
      enqueueSnackbar("Success! Item deleted.", { variant: 'success' })
    } else {
      enqueueSnackbar("Error! Couldn't delete item.", { variant: 'error' })
      return
    }

    // Execute parent component functionality
    props.handleDelete()
  }

  return (
    <>
      <Dialog
        open={props.open}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={handleClose}
      >
        <DialogTitle id='alert-dialog-title'>{'Delete item?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            This action cannot be undone, the item will be deleted permanently. Are you sure you want to delete?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            color='default'
            title='Cancel'
            startIcon={<CancelIcon />}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='secondary'
            title='Delete'
            startIcon={<DeleteForeverIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
