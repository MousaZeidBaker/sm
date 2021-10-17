import React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import { LoginItemDialog } from './login-item-form'
import { LoginItemApi } from '../../backend/models/login/login-item-api'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  handleAdd: (item: LoginItemApi) => void
}

export function AddLoginItemFormDialog(props: Props): JSX.Element {
  // Prepare empty item
  const dummyItem: LoginItemApi = {
    id: '',
    type: 'logins',
    attributes: {
      version: 0,
      lastModifiedDate: new Date(), 
      title: '',
      path: '/',
      username: '',
      secret: '',
      note: ''
    }
  }

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
   * @param {LoginItemApi} item - The item to add
   * 
   * @return {Promise<void>}
   */
  const handleAdd = async (item: LoginItemApi): Promise<void> => {
    // Close dialog immediately
    props.setOpen(false)

    // Execute parent component functionality
    props.handleAdd(item)
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
          open={props.open}
          setOpen={props.setOpen}
          item={dummyItem}
          handleSave={(item: LoginItemApi) => handleAdd(item)}
        />
      </Dialog>
    </>
  )
}
