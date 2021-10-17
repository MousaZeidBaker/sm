import React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import CancelIcon from '@mui/icons-material/Cancel'
import useSession from '../components/useSession'
import { LoginItemApi } from '../backend/models/login/login-item-api'
import { useSnackbar } from 'notistack'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  item: LoginItemApi
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
    const response = await fetch(`/api/v1.0/${props.item.type}/${props.item.id}`, {
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

  return <>
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
          title='Cancel'
          startIcon={<CancelIcon />}
          onClick={handleClose}>
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
}
