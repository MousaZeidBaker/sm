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
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles({
  appBar: {
    position: 'relative'
  },
  title: {
    flexGrow: 1
  }
})

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
}

export function Header(props: Props) {
  const { session, signOut } = useSession()
  const classes = useStyles()
  const router = useRouter()

  // Determine current tab value
  let index = tabs.findIndex(item => item.url === router.pathname)
  index = index === -1 ? 0 : index // Fallback to tab 0 if index not found
  const [ tabValue ] = React.useState(index)

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

  return (
    <div>
      <AppBar className={classes.appBar}>
        <Toolbar color='secondary' >
          <Typography className={classes.title}>
            <small>Signed in as:</small><br/>
            <strong>{session?.user.username}</strong>
          </Typography>
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
