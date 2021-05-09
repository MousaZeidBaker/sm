import React from 'react'
import { Layout } from '../components/layout'
import { OverflowMenu } from '../components/overflow-menu'
import { DataGrid, GridColDef, GridValueFormatterParams, GridCellParams, GridOverlay, GridToolbarContainer, GridToolbar } from '@material-ui/data-grid'
import LinearProgress from '@material-ui/core/LinearProgress'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import { LoginItemApi } from '../backend/models/login/login-item-api'
import { AddLoginItemFormDialog } from '../components/login-item/add-login-item-form-dialog'
import { Secret } from '../components/secret'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'
import useSession from '../components/useSession'
import { Theme } from '@material-ui/core/styles'
import { useSnackbar } from 'notistack'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: 700,
    width: '100%',
  },
  dataGrid: {
    border: 0,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2)
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    width: '100%'
  }
}))

export default function Page(): JSX.Element {
  const [ content, setContent ] = React.useState<Array<any>>([])
  const [ loading, setLoading ] = React.useState<boolean>(false)
  const [ openAddLoginItemFormDialog, setOpenAddLoginItemFormDialog ] = React.useState<boolean>(false)

  const classes = useStyles()
  const { session } = useSession()
  const { enqueueSnackbar } = useSnackbar()

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbar />
      </GridToolbarContainer>
    )
  }

  function CustomLoadingOverlay() {
    return (
      <GridOverlay>
        <div className={classes.gridOverlay}>
          <LinearProgress />
        </div>
      </GridOverlay>
    )
  }

  // Fetch data
  React.useEffect(() => {
    const fetchData = async () => {
      if (!session) return

      setLoading(true)

      const response = await fetch('/api/v1.0/logins', {
        headers: {
          'Authorization': session.idToken
        }
      })

      setContent([])
      if (response.status === 200) {
        const json = await response.json()
        setContent(json?.data || [])
      } else {
        enqueueSnackbar("Error! Couldn't load items.", { variant: 'error' })
      }

      setLoading(false)
    }
    fetchData()
  }, [session])

  /**
   * Handles version change event
   * 
   * @param {string} id - The id of the item
   * @param {string} id - The version of the item
   * @return {Promise<void>}
   */
  const handleVersionChange = async (id: string, version: number): Promise<void> => {
    setLoading(true)

    const res = await fetch(`/api/v1.0/logins/${id}?version=${version}`, {
      headers: {
        'Authorization': session?.idToken || ''
      }
    })
    const json = await res.json()

    if (json.data) {
      const newItem = json.data
      setContent(content.map(item => {
        // Return the new item
        if (item.id === newItem.id) return newItem

        // Return all other items
        return item
      }))
    }

    setLoading(false)
  }

  /**
   * Handles edit event
   * 
   * @param {string} id - The id of the item
   * @return {Promise<void>}
   */
  const handleEdit = async (id: string): Promise<void> => {
    setLoading(true)

    const res = await fetch(`/api/v1.0/logins/${id}`, {
      headers: {
        'Authorization': session?.idToken || ''
      }
    })
    const json = await res.json()

    if (json.data) {
      const updatedItem = json.data
      setContent(content.map(item => {
        // Return the updated item
        if (item.id === updatedItem.id) return updatedItem

        // Return all other items
        return item
      }))
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
    setContent(content.filter(item => item.id !== id))
    setLoading(false)
  }

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
   * @param {string} id - The id of the item
   * @return {Promise<void>}
   */
  const handleAdd = async (): Promise<void> => {
    setLoading(true)

    const res = await fetch(`/api/v1.0/logins`, {
      headers: {
        'Authorization': session?.idToken || ''
      }
    })
    const json = await res.json()
    if (json.data) setContent(json.data)

    setLoading(false)
  }

    // DataGrid rows
    const rows = content.map((item: LoginItemApi) => ({
      id: item.id,
      version: item.attributes.version,
      lastModifiedDate: item.attributes.lastModifiedDate,
      title: item.attributes.title,
      path: item.attributes.path,
      username: item.attributes.username,
      secret: item.attributes.secret
    }))

  // Determine longest values, used to set the column length on the data grid
  const longestTitle = Math.max(...(content.map((item: LoginItemApi) => item.attributes.title?.length)))
  const longestUsername = Math.max(...(content.map((item: LoginItemApi) => item.attributes.username?.length)))
  const longestPassword = Math.max(...(content.map((item: LoginItemApi) => item.attributes.secret?.length)))

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 220,
      hide: true
    },
    {
      field: 'title',
      headerName: 'Title',
      // The width is set dynamically adjusted to the longest string or to a fixed minimum
      width: longestTitle > 12 ? longestTitle*12 : 150
    },
    {
      field: 'username',
      headerName: 'Username',
      // The width is set dynamically adjusted to the longest string or to a fixed minimum
      width: longestUsername > 12 ? longestUsername*12 : 150
    },
    {
      field: 'secret',
      headerName: 'Secret',
      // The width is set dynamically adjusted to the longest string plus some fixed width for the buttons
      width: longestPassword > 25 ? (longestPassword*12)+100 : (longestPassword*12)+200,
      disableClickEventBubbling: true,
      renderCell: (params: GridCellParams): JSX.Element => {
        return (
          <Secret
            secret={params.getValue('secret') as string}
          />
        )
      }
    },
    {
      field: 'path',
      headerName: 'Path',
      hide: true
    },
    {
      field: 'lastModifiedDate',
      headerName: 'Last modified date',
      width: 175,
      valueFormatter: (params: GridValueFormatterParams) => (new Date(params.value as string)).toDateString()
    },
    {
      field: 'version',
      headerName: 'Version',
      width: 101,
      renderCell: (params: GridCellParams): JSX.Element => {
        return (
          <TextField
            id='version'
            type='number'
            InputProps={{ disableUnderline: true, inputProps: { min: 1} }}
            value={params.getValue('version')}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleVersionChange(params.getValue('id') as string, event.target.valueAsNumber)}
          >
          </TextField>
        )
      }
    },
    {
      // This column contains the overflow menu
      field: '',
      disableClickEventBubbling: true,
      disableColumnMenu: true,
      renderCell: (params: GridCellParams): JSX.Element => {
        return (
          <OverflowMenu
            id={params.getValue('id') as string}
            title={params.getValue('title') as string}
            username={params.getValue('username') as string}
            secret={params.getValue('secret') as string}
            path={params.getValue('path') as string}
            itemType={'logins'}
            handleEdit={() => handleEdit(params.getValue('id') as string)}
            handleDelete={() => handleDelete(params.getValue('id') as string)}
          />
        )
      }
    }
  ]

  return (
    <Layout>
      <div className={classes.root}>
        {/* A data grid */}
        <DataGrid
          className={classes.dataGrid}
          rows={rows}
          columns={columns}
          pageSize={10}
          disableSelectionOnClick={false}
          components={{
            Toolbar: CustomToolbar,
            LoadingOverlay: CustomLoadingOverlay,
          }}
          loading={loading as boolean}
          sortModel={[
            {
              field: 'title',
              sort: 'asc'
            }
          ]}
        />
      </div>
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
      <>
        {/* An input form for adding items */}
        <AddLoginItemFormDialog
          open={openAddLoginItemFormDialog}
          setOpen={setOpenAddLoginItemFormDialog}
          itemType={'logins'}
          handleAdd={handleAdd}
        />
      </>
    </Layout>
  )
}
