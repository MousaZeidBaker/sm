import React from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { DeleteItemAlertDialog } from './delete-item-alert-dialog'
import { EditLoginItemFormDialog } from './login-item/edit-login-item-form-dialog'
import { LoginItemApi } from '../backend/models/login/login-item-api'

interface Props {
  item: LoginItemApi
  handleEdit: (item: LoginItemApi) => void
  handleDelete: () => void
}

export function OverflowMenu(props: Props): JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [openEditFormDialog, setOpenEditFormDialog] = React.useState(false)
  const [openDeleteAlertDialog, setOpenDeleteAlertDialog] = React.useState(false)

  /**
   * Handles menu click event
   * 
   * @param {React.MouseEvent<HTMLButtonElement>} event
   * @return {void}
   */
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  /**
   * Handles menu close event
   * 
   * @return {void}
   */
  const handleMenuClose = (): void => {
    setAnchorEl(null)
  }

  /**
   * Handles menu edit event
   * 
   * @return {void}
   */
  const handleMenuEdit = (): void => {
    // Open edit dialog
    setOpenEditFormDialog(true)

    // Close overflow menu
    handleMenuClose()
  }

  /**
   * Handles edit event
   * 
   * @param {LoginItemApi} item - The item to update
   * 
   * @return {void}
   */
  const handleEdit = (item: LoginItemApi): void => {
    // Execute parent component functionality
    props.handleEdit(item)
  }

  /**
   * Handles menu delete event
   * 
   * @return {void}
   */
  const handleMenuDelete = (): void => {
    // Open delete dialog
    setOpenDeleteAlertDialog(true)

    // Close overflow menu
    handleMenuClose()
  }

  /**
   * Handles delete event
   * 
   * @return {void}
   */
  const handleDelete = (): void => {
    // Execute parent component functionality
    props.handleDelete()

    // Close dialog
    setOpenDeleteAlertDialog(false)
  }

  return (
    <>
      <>
        {/* Overflow menu that opens over the anchor element */}
        <Button
          aria-controls='overflow-menu'
          aria-haspopup='true'
          title='Menu'
          onClick={handleMenuClick}
          >
          <MoreVertIcon/>
        </Button>
        <Menu
          id='overflow-menu'
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuEdit}>Edit</MenuItem>
          <MenuItem onClick={handleMenuDelete}>Delete</MenuItem>
        </Menu>
      </>
      <>
        {/* A Dialog that asks for confirmation before deleting */}
          <DeleteItemAlertDialog
            open={openDeleteAlertDialog}
            setOpen={setOpenDeleteAlertDialog}
            item={props.item}
            handleDelete={handleDelete}
          />
      </>
      <>
        {/* An input form for editing items */}
        <EditLoginItemFormDialog
          open={openEditFormDialog}
          setOpen={setOpenEditFormDialog}
          item={props.item}
          handleEdit={(item: LoginItemApi) => handleEdit(item)}
        />
      </>
    </>
  )
}
