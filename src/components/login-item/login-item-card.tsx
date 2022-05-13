import React from 'react'
import { OverflowMenu } from '../../components/overflow-menu'
import { LoginItemApi } from '../../backend/models/login/login-item-api'
import { LoginItemDecryptedData } from '../../backend/models/login/login-item'
import makeStyles from '@mui/styles/makeStyles'
import useSession from '../../components/useSession'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import clsx from 'clsx'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import Button from '@mui/material/Button'
import { CopyContentIcon } from '../../icons/content_copy-icon'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { useSnackbar } from 'notistack'
import MenuItem from '@mui/material/MenuItem'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import CancelIcon from '@mui/icons-material/Cancel'
import { AlertDialog } from '../alert-dialog'
import { LoginItemFormDialog } from '../login-item/login-item-form-dialog'

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    padding: theme.spacing(2),
    color: theme.palette.primary.main,
    wordBreak: 'break-all'
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)'
  },
  buttons: {
    marginTop: 16
  },
  button: {
    marginRight: -8
  }
}))

interface Props {
  item: LoginItemApi
  handleDelete: (id: string) => void
}

export default function LoginItemCard(props: Props): JSX.Element {
  const [ item, setItem ] = React.useState<LoginItemApi>(props.item)
  const [ expanded, setExpanded ] = React.useState(false)
  const [ showSecret, setShowSecret ] = React.useState<boolean>(false)
  const [ loading, setLoading ] = React.useState<boolean>(false)

  const classes = useStyles()
  const { user } = useSession()
  const { enqueueSnackbar } = useSnackbar()

  /**
   * Handles edit event
   * 
   * @param {LoginItemApi} item - The updated item
   * @return {Promise<void>}
   */
  const handleEdit = async (item: LoginItemApi): Promise<void> => {
    setLoading(true)

    enqueueSnackbar("Updating item...", { variant: 'info' })

    // API request to edit login item
    const attributes: LoginItemDecryptedData = {
      title: item.attributes.title,
      path: item.attributes.path,
      username: item.attributes.username,
      secret: item.attributes.secret,
      note: item.attributes.note
    }
    const response = await fetch(`/api/v1.0/${item.type}/${item.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': user?.getSignInUserSession()?.getIdToken().getJwtToken() || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'data': {
          'type': item.type,
          'id': item.id,
          'attributes': attributes
        }
      })
    })

    if (response.status === 200) {
      const jsonResponse = await response.json()

      const updatedItem = jsonResponse.data
      setItem(updatedItem)
      enqueueSnackbar("Success! Item updated.", { variant: 'success' })
    } else {
      enqueueSnackbar("Error! Couldn't update item.", { variant: 'error' })
    }

    setLoading(false)
  }

  /**
   * Handles delete event
   * 
   * @return {Promise<void>}
   */
  const handleDelete = async (): Promise<void> => {
    setLoading(true)

    enqueueSnackbar("Deleting item...", { variant: 'info' })

    // API request to delete item
    const response = await fetch(`/api/v1.0/${item.type}/${item.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': user?.getSignInUserSession()?.getIdToken().getJwtToken() || '',
      }
    })

    // Show snackbar message
    if (response.status === 204) {
      // Execute parent component functionality
      props.handleDelete(item.id)

      enqueueSnackbar("Success! Item deleted.", { variant: 'success' })
    } else {
      enqueueSnackbar("Error! Couldn't delete item.", { variant: 'error' })
      return
    }

    setLoading(false)
  }

  /**
   * Handles version change event
   * 
   * @param {string} id - The id of the item
   * @param {string} version - The version of the item
   * @return {Promise<void>}
   */
  const handleVersionChange = async (id: string, version: number): Promise<void> => {
    setLoading(true)

    const response = await fetch(`/api/v1.0/logins/${id}?version=${version}`, {
      headers: {
        'Authorization': user?.getSignInUserSession()?.getIdToken().getJwtToken() || ''
      }
    })

    if (response.status === 200) {
      const jsonResponse = await response.json()

      const newItem = jsonResponse.data
      setItem(newItem)
    } else {
      enqueueSnackbar("Error! Version not found.", { variant: 'error' })
    }

    setLoading(false)
  }

  const [openMenu, setOpenMenu] = React.useState(false)
  const [openEditFormDialog, setOpenEditFormDialog] = React.useState(false)
  const [openDeleteAlertDialog, setOpenDeleteAlertDialog] = React.useState(false)

  /**
   * Handles menu edit event
   * 
   * @return {void}
   */
  const handleMenuEdit = (): void => {
    // Open edit dialog
    setOpenEditFormDialog(true)

    // Close overflow menu
    setOpenMenu(false)
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
    setOpenMenu(false)
  }

  return (
    <>
      <>
        {/* A grid containing all item cards */}
        <Grid key={item.id} item={true} xs={12} sm={4}>
          <Card className={classes.card}>
            <CardHeader
              action={
                <div>
                  {/* Render an overflow menu */}
                  <div>
                    {!loading && <>
                      <OverflowMenu
                        open={openMenu}
                        setOpen={setOpenMenu}
                        menuItems={[
                          <MenuItem key="edit" onClick={handleMenuEdit}>Edit</MenuItem>,
                          <MenuItem key="delete" onClick={handleMenuDelete}>Delete</MenuItem>
                        ]}
                      />
                    </>}
                  </div>
                  {/* Render a progress bar */}
                  <div>
                    {loading && <>
                      <CircularProgress/>
                    </>}
                  </div>
                </div>
              }
              title={item.attributes.title}
              subheader={new Date(item.attributes.lastModifiedDate).toDateString()}
            />
            <CardActions disableSpacing>
              {/* Render expand button and handle card expansion */}
              <IconButton
                className={clsx(classes.expand, {
                  [classes.expandOpen]: expanded,
                })}
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                aria-label='expand card'
                size="large">
                <ExpandMoreIcon />
              </IconButton>
            </CardActions>
            <Collapse in={expanded} timeout='auto' unmountOnExit>
              <CardContent>
                {/* Display item data */}
                <Typography paragraph color='textSecondary'>Version:</Typography>
                <Typography paragraph>{item.attributes.version}</Typography>
                <Typography paragraph color='textSecondary'>Username:</Typography>
                <Typography paragraph>{item.attributes.username}</Typography>
                <Typography paragraph color='textSecondary'>Secret:</Typography>
                {/* Show secret */}
                {showSecret && <>
                  <Typography paragraph>{item.attributes.secret}</Typography>
                </>}
                {/* Hide secret */}
                {!showSecret && <>
                  <Typography paragraph>{item.attributes.secret.replace(/.?/g, '\u2022')}</Typography>
                </>}
                <Typography paragraph color='textSecondary' style={{whiteSpace: 'pre-line'}}>{item.attributes.note}</Typography>
                <Divider />
                <div className={classes.buttons}>
                  {/* Hide/Show button */}
                  <Button
                    className={classes.button}
                    size='small'
                    title={showSecret ? 'Hide' : 'Show'}
                    onClick={() => setShowSecret(!showSecret)}>
                    {showSecret ? < VisibilityOff/> : <VisibilityIcon />}
                  </Button>
                  {/* Copy button */}
                  <Button
                    className={classes.button}
                    size='small'
                    title='Copy'
                    onClick={() => navigator.clipboard.writeText(item.attributes.secret)}>
                      <CopyContentIcon/>
                  </Button>
                  {/* Arrow up button */}
                  <Button
                    className={classes.button}
                    size='small'
                    title='Version up'
                    onClick={() => handleVersionChange(item.id, item.attributes.version + 1)}>
                    <ArrowUpwardIcon/>
                  </Button>
                  {/* Arrow down button */}
                  <Button
                    className={classes.button}
                    size='small'
                    title='Version down'
                    disabled={item.attributes.version < 2}
                    onClick={() => handleVersionChange(item.id, item.attributes.version - 1)}>
                    <ArrowDownwardIcon/>
                  </Button>
                </div>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>
      </>
      <>
        {/* An input form for editing items */}
        <LoginItemFormDialog
          title='Edit item'
          open={openEditFormDialog}
          setOpen={setOpenEditFormDialog}
          item={item}
          handleSave={(item: LoginItemApi) => handleEdit(item)}
        />
      </>
      <>
        {/* An alert dialog that asks for confirmation before deleting */}
          <AlertDialog
            open={openDeleteAlertDialog}
            title="Delete item?"
            content="This action cannot be undone, the item will be deleted permanently. Are you sure you want to delete?"
            actions={
              <>
                <Button
                  variant='contained'
                  title='Cancel'
                  startIcon={<CancelIcon />}
                  onClick={() => {setOpenDeleteAlertDialog(false)}}
                >
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  title='Delete'
                  startIcon={<DeleteForeverIcon />}
                  onClick={() => {
                    setOpenDeleteAlertDialog(false)
                    handleDelete()
                  }}
                  color='secondary'
                >
                  Delete
                </Button>
              </>
            }
          />
      </>
    </>
  )
}
