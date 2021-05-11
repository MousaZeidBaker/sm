import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import { LoginItemDialog } from './login-item-form'
import { LoginItemApi } from '../../backend/models/login/login-item-api'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  item: LoginItemApi
  handleEdit: (item: LoginItemApi) => void
}

export function EditLoginItemFormDialog(props: Props): JSX.Element {
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
   * @param {LoginItemApi} item - The item to update
   * 
   * @return {Promise<void>}
   */
  const handleEdit = async (item: LoginItemApi): Promise<void> => {
    // Close dialog immediately
    props.setOpen(false)

    // Execute parent component functionality
    props.handleEdit(item)
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
          open={props.open}
          setOpen={props.setOpen}
          item={props.item}
          handleSave={(item: LoginItemApi) => handleEdit(item)}
        />
      </Dialog>
    </>
  )
}
