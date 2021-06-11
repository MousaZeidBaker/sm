import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import useSession from '../components/useSession'
import { LogoutIcon } from '../icons/logout_icon'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { useRouter } from 'next/router'
import BrightnessHighIcon from '@material-ui/icons/BrightnessHigh'
import Brightness4Icon from '@material-ui/icons/Brightness4'
import SearchIcon from '@material-ui/icons/Search'
import InputBase from '@material-ui/core/InputBase'
import { fade, makeStyles } from '@material-ui/core/styles'
import { useMediaQuery } from 'react-responsive'

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
  lightTheme: boolean
  setLightTheme: (lightTheme: boolean) => void
  showSearchBar: boolean
  handleSearchChange: (pattern: string) => void
}

export function Header(props: Props) {
  const { session, signOut } = useSession()
  const router = useRouter()

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
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25)
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
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: '20ch'
      }
    }
  }))
  const classes = useStyles()

  /**
   * Handles light theme change
   * 
   * @return {void}
   */
  const handleLightTheme = (lightTheme: boolean): void => {
    // Execute parent component functionality
    props.setLightTheme(lightTheme)

    // Store value in local storage
    localStorage.setItem('lightTheme', lightTheme.toString())
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
              <strong>{session?.user.username}</strong>
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
              <Button
                color='default'
                title='Toggle light/dark theme'
                onClick={() => handleLightTheme(!props.lightTheme)}
              >
                {props.lightTheme ? < Brightness4Icon/> : <BrightnessHighIcon />}
              </Button>
              {/* Sign out button */}
              <Button
                variant='outlined'
                title='Sign out'
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
