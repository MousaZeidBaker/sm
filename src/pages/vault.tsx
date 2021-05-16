import React from 'react'
import { Layout } from '../components/layout'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import { LoginItemApi } from '../backend/models/login/login-item-api'
import { AddLoginItemFormDialog } from '../components/login-item/add-login-item-form-dialog'
import { makeStyles } from '@material-ui/core/styles'
import useSession from '../components/useSession'
import { Theme } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import Grid from '@material-ui/core/Grid'
import LoginItemCard from '../components/login-item/login-item-card'
import { useSnackbar } from 'notistack'
import Fuse from 'fuse.js'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1
  },
  dataGrid: {
    border: 0
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2)
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    width: '100%'
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: 'rotate(180deg)'
  }
}))

export default function Page(): JSX.Element {
  const [ allItems, setAllItems ] = React.useState<Array<LoginItemApi>>([])
  const [ itemsToShow, setItemsToShow ] = React.useState<Array<LoginItemApi>>([])
  const [ lastSearchPattern, setLastSearchPattern ] = React.useState<string>('')
  const [ loading, setLoading ] = React.useState<boolean>(false)
  const [ openAddLoginItemFormDialog, setOpenAddLoginItemFormDialog ] = React.useState<boolean>(false)

  const classes = useStyles()
  const { session } = useSession()
  const { enqueueSnackbar } = useSnackbar()

  /**
   * Configure Fuse. Fuse is used for fuzzy-searching
   */
  const options: Fuse.IFuseOptions<LoginItemApi> = {
    includeScore: false,
    keys: ['attributes.title']
  }
  const fuse = new Fuse(allItems, options)

  /**
   * Hook that fetches all items on page reload
   */
  React.useEffect(() => {
    const fetchData = async () => {
      if (!session) return

      setLoading(true)

      const response = await fetch('/api/v1.0/logins', {
        headers: {
          'Authorization': session.idToken
        }
      })

      if (response.status === 200) {
        const jsonResponse = await response.json()

        setAllItems([...jsonResponse.data])
        setItemsToShow([...jsonResponse.data])
      } else {
        enqueueSnackbar("Error! Couldn't load items.", { variant: 'error' })
      }

      setLoading(false)
    }
    fetchData()
  }, [session])

  /**
   * Hook that updates itemsToShow list, triggered on changes to the allItems list
   */
  React.useEffect(() => {
    handleSearchChange(lastSearchPattern)
  }, [allItems])

  /**
   * Handles Fab click event
   * 
   * @return {void}
   */
  const handleFabClick = (): void => {
    setOpenAddLoginItemFormDialog(true)
  }

  /**
   * Handles add event
   * 
   * @param {LoginItemApi} item - The item to add
   * 
   * @return {Promise<void>}
   */
  const handleAdd = async (item: LoginItemApi): Promise<void> => {
    setLoading(true)

    enqueueSnackbar("Adding item...", { variant: 'info' })

    // API request to add new login item
    const response = await fetch(`/api/v1.0/${item.type}`, {
      method: 'POST',
      headers: {
        'Authorization': session?.idToken || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'data': {
          'type': item.type,
          'attributes': {
            title: item.attributes.title,
            path: item.attributes.path,
            username: item.attributes.username,
            secret: item.attributes.secret
          }
        }
      })
    })

    if (response.status === 200) {
      const jsonResponse = await response.json()

      const addedItem = jsonResponse.data
      setAllItems([...allItems, addedItem])
      enqueueSnackbar("Success! Item updated.", { variant: 'success' })
    } else {
      enqueueSnackbar("Error! Couldn't update item.", { variant: 'error' })
      return
    }

    setLoading(false)
  }
  
  /**
   * Handles delete event
   * 
   * @param {string} id - The id of the item
   * @return {Promise<void>}
   */
  const handleDelete = async (id: string): Promise<void> => {
    setLoading(true)
    setAllItems(allItems.filter(item => item.id !== id))
    setLoading(false)
  }

  /**
   * Handles search change event
   * 
   * @param {string} pattern The search pattern to search for
   * @return {void}
   */
  const handleSearchChange = (pattern: string): void => {
    setLastSearchPattern(pattern)

    if(!pattern) {
      setItemsToShow(allItems)
      return
    }

    const matches = fuse.search(pattern)
    if (matches.length === 0) {
      setItemsToShow([])
    } else {
      setItemsToShow(matches.map(match => {
        return match.item
      }))
    }
  }

  const cards = itemsToShow.map((item: LoginItemApi): JSX.Element => (
    <LoginItemCard
      key={item.id}
      item={item}
      handleDelete={handleDelete}
    />
  ))

  return (
    <Layout
      showSearchBar={true}
      handleSearchChange={handleSearchChange}
    >
      {/* Progress bars */}
      <div>
        {loading && <>
          <LinearProgress/>
        </>}
      </div>

      <Grid
        className={classes.root}
        container={true}
        justify='flex-start'
        spacing={2}
      >
        {/* Item cards */}
        {itemsToShow.map((item: LoginItemApi): JSX.Element => (
          <LoginItemCard
            key={item.id}
            item={item}
            handleDelete={handleDelete}
          />
        ))}
      </Grid>
      <div>
        {/* A floating action button */}
        <Fab
          className={classes.fab}
          color='primary'
          aria-label='add'
          onClick={handleFabClick}
        >
          <AddIcon />
        </Fab>
      </div>
      <div>
        {/* An input form for adding items */}
        <AddLoginItemFormDialog
          open={openAddLoginItemFormDialog}
          setOpen={setOpenAddLoginItemFormDialog}
          handleAdd={(item: LoginItemApi) => handleAdd(item)}
        />
      </div>
    </Layout>
  )
}
