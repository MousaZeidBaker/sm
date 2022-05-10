import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import useSession from '../components/useSession'
import { LogoutIcon } from '../icons/logout_icon'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useRouter } from 'next/router'
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import SearchIcon from '@mui/icons-material/Search'
import InputBase from '@mui/material/InputBase'
import { alpha } from '@mui/material/styles'
import makeStyles from '@mui/styles/makeStyles'
import { useMediaQuery } from 'react-responsive'
import { ThemeContext } from '../pages/_app'

const tabs = [
  {
    label: 'Home',
    url: '/'
  },
  {
    label: 'Vault',
    url: '/vault'
  }
]

interface Props {
  showSearchBar: boolean
  handleSearchChange: (pattern: string) => void
}

export function Header(props: Props): JSX.Element {
  const { user, signOut } = useSession()

  const router = useRouter()
  const themeContext = React.useContext(ThemeContext)

  // Determine current tab value
  let index = tabs.findIndex(item => item.url === router.pathname)
  index = index === -1 ? 0 : index // Fallback to tab 0 if index not found
  const [ tabValue ] = React.useState(index)

  const isBigScreen = useMediaQuery({ query: `(min-width: 650px)` })

  const useStyles = makeStyles((theme) => ({
    appBar: {
      position: 'relative'
    },
    grow: {
      flexGrow: 1
    },
    title: {
      flexGrow: 1
    },
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25)
      },
      marginRight: theme.spacing(2),
      marginLeft: 0,
      width: isBigScreen ? '100%' : '40%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto'
      }
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    inputRoot: {
      color: 'inherit'
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: '20ch'
      }
    }
  }))
  const classes = useStyles()

  /**
   * Toggle palette mode
   * 
   * @return {void}
   */
  const togglePaletteMode = (): void => {
    themeContext.togglePaletteMode()
    // States are updated asynchronously, paletteMode will contain the previous value
    const nextPaletteMode = themeContext.paletteMode === 'light' ? 'dark' : 'light'
    // Store value in local storage
    localStorage.setItem('themePaletteMode', nextPaletteMode)
  }

  /**
   * Handles tab change event
   * 
   * @param {React.ChangeEvent<{}>} event
   * @param {number} newValue
   * @return {Promise<void>}
   */
  const handleTabChange = async (event: React.ChangeEvent<{}>, newValue: number): Promise<void> => {
    event.preventDefault()
    // Navigate to the new tab page
    const tab = tabs[newValue]
    router.push(tab.url)
  }

  /**
   * Handles search change event
   * 
   * @param {React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>} event
   * @return {Promise<void>}
   */
  const handleSearchChange = async (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): Promise<void> => {
    props.handleSearchChange(event.target.value)
  }

  return (
    <div className={classes.grow}>
      <AppBar className={classes.appBar}>
        <Toolbar color='secondary' >
          {/* Skip on smaller screens */}
         {isBigScreen && <>
            <Typography className={classes.title}>
              <small>Signed in as:</small><br/>
              <strong>{user?.username}</strong>
            </Typography>
          </>}
          {/* Show search bar only if parent component requires it */}
          {props.showSearchBar && <>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder='Search…'
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
                onChange={(event) => handleSearchChange(event)}
              />
            </div>
            </>}
          <div>
            <div>
              {/* Toggle light/dark theme button */}
              <Button title='Toggle light/dark theme' color='inherit' onClick={() => togglePaletteMode()}>
                {themeContext.paletteMode === 'light' ? < Brightness4Icon/> : <BrightnessHighIcon />}
              </Button>
              {/* Sign out button */}
              <Button
                variant='outlined'
                title='Sign out'
                color='inherit'
                startIcon={<LogoutIcon />}
                onClick={signOut}
              >
                Sign out
              </Button>
            </div>
          </div>
        </Toolbar>
        {/* Tabs */}
        <Tabs
          value={tabValue}
          textColor='inherit'
          TabIndicatorProps={{
            style: {
              backgroundColor: "#fff"
            }
          }}
          onChange={(event, newValue) => handleTabChange(event, newValue)}
        >
          {tabs.map((item: any, index: number) =>
            <Tab
              key={`tab-${index}`}
              label={item.label}
              id={`tab-${index}`}
              aria-controls={`tabpanel-${index}`}
            />
          )}
        </Tabs>
      </AppBar>
    </div>
  )
}
