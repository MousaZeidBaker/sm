import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import useSession from '../useSession'
import { LoginItemDialog, LoginItemFormValues } from './login-item-form'
import { useSnackbar } from 'notistack'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  id: string
  itemType: string
  values: LoginItemFormValues
  handleEdit: () => void
}

export function EditLoginItemFormDialog(props: Props): JSX.Element {
  const initialFormValues: LoginItemFormValues = {
    title: props.values.title,
    username: props.values.username,
    secret: props.values.secret,
    path: props.values.path
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
   * Handles edit event
   * 
   * @param {LoginItemFormValues} formValues - The form values
   * 
   * @return {Promise<void>}
   */
  const handleEdit = async (formValues: LoginItemFormValues): Promise<void> => {
    // Close dialog immediately, use snackbar to inform user about the process
    props.setOpen(false)
    enqueueSnackbar("Updating item...", { variant: 'info' })

    // API request to edit login item
    const response = await fetch(`/api/v1.0/${props.itemType}/${props.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': session?.idToken || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'data': {
          'type': props.itemType,
          'id': props.id,
          'attributes': formValues
        }
      })
    })

    // Show snackbar message
    if (response.status === 200) {
      enqueueSnackbar("Success! Item updated.", { variant: 'success' })
    } else {
      enqueueSnackbar("Error! Couldn't update item.", { variant: 'error' })
      return
    }

    // Execute parent component functionality
    props.handleEdit()
  }

  return (
    <>
      <Dialog
        open={props.open}
        onClose={handleClose}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>Edit item</DialogTitle>
        <LoginItemDialog
          initialFormValues={initialFormValues}
          open={props.open}
          setOpen={props.setOpen}
          itemType={props.itemType}
          handleSave={handleEdit}
        />
      </Dialog>
    </>
  )
}
