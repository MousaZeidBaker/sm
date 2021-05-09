import React from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import { DeleteItemAlertDialog } from './delete-item-alert-dialog'
import { EditLoginItemFormDialog } from './login-item/edit-login-item-form-dialog'

interface Props {
  id: string
  title: string
  username: string
  secret: string
  path: string
  itemType: string
  handleEdit: () => void
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
   * @return {void}
   */
  const handleEdit = (): void => {
    // Execute parent component functionality
    props.handleEdit()
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
            id={props.id}
            itemType={props.itemType}
            handleDelete={handleDelete}
          />
      </>
      <>
        {/* An input form for editing items */}
        <EditLoginItemFormDialog
          open={openEditFormDialog}
          setOpen={setOpenEditFormDialog}
          id={props.id}
          itemType={props.itemType}
          values={{
            title: props.title,
            username: props.username,
            secret: props.secret,
            path: props.path
          }}
          handleEdit={handleEdit}
        />
      </>
    </>
  )
}
