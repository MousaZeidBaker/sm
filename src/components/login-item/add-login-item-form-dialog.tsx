import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import { LoginItemDialog, LoginItemFormValues } from './login-item-form'
import useSession from '../useSession'
import { useSnackbar } from 'notistack'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  itemType: string
  handleAdd: () => void
}

export function AddLoginItemFormDialog(props: Props): JSX.Element {
  const initialFormValues: LoginItemFormValues = {
    title: '',
    username: '',
    secret: '',
    path: '/'
  }

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
   * Handles add event
   * 
   * @param {LoginItemFormValues} formValues - The form values
   * 
   * @return {Promise<void>}
   */
  const handleAdd = async (formValues: LoginItemFormValues): Promise<void> => {
    // Close dialog immediately, use snackbar to inform user about the process
    props.setOpen(false)
    enqueueSnackbar("Adding item...", { variant: 'info' })

    // API request to add new login item
    const response = await fetch(`/api/v1.0/${props.itemType}`, {
      method: 'POST',
      headers: {
        'Authorization': session?.idToken || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'data': {
          'type': props.itemType,
          'attributes': formValues
        }
      })
    })

    // Show snackbar message
    if (response.status === 200) {
      enqueueSnackbar("Success! Item added.", { variant: 'success' })
    } else {
      enqueueSnackbar("Error! Couldn't add item.", { variant: 'error' })
      return
    }

    // Execute parent component functionality
    props.handleAdd()
  }

  return (
    <>
      <Dialog
        open={props.open}
        onClose={handleClose}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>Add item</DialogTitle>
        <LoginItemDialog
          initialFormValues={initialFormValues}
          open={props.open}
          setOpen={props.setOpen}
          itemType={props.itemType}
          handleSave={handleAdd}
        />
      </Dialog>
    </>
  )
}
