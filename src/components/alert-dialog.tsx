import React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

interface Props {
  open: boolean
  title: string
  content: string
  actions: JSX.Element
}

export function AlertDialog(props: Props): JSX.Element {
  return (
    <>
      <Dialog
        open={props.open}
        aria-labelledby='dialog-title'
        aria-describedby='dialog-description'
      >
        <DialogTitle id='dialog-title'>{props.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id='-dialog-description'>
            {props.content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {props.actions}
        </DialogActions>
      </Dialog>
    </>
  )
}
