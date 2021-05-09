import { Header } from './header'
import React from 'react'
import { createMuiTheme, ThemeProvider, CssBaseline, Theme, makeStyles } from '@material-ui/core'
import { pink, grey } from '@material-ui/core/colors'

/**
  * Create a useState hook with an initial state from local storage
  * 
  * @param {string} localStorageKey Key of item to retrieve from local storage
  * @param {any} defaultValue Default value to use if key does not exist
  * 
  * @returns React.useState hook
  */
function useStateWithLocalStorage (localStorageKey: string, defaultValue: any) {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(localStorageKey)

    // If item does not exist, use default value
    if (item === null) {
      return React.useState(defaultValue)
    }

    // If item is a boolean string, convert to boolean
    if (item === 'true' || item === 'false') {
      return React.useState<boolean>((item === 'true'))
    }

    return React.useState(item)
  }
 
  return React.useState(defaultValue)
}

const useStyles = makeStyles({
  main: {
    marginTop: '1%',
    marginLeft: '10%',
    marginRight: '10%'
  }
})

interface Props {
  children: React.ReactNode
}

export function Layout (props: Props): JSX.Element {
  const [lightTheme, setLightTheme] = useStateWithLocalStorage('lightTheme', true)
  const classes = useStyles()

  const primaryColor = process.env.NEXT_PUBLIC_APP_PRIMARY_COLOR || '#2196f3'
  const theme: Theme = React.useMemo(() => {
    return createMuiTheme({
      palette: {
        type: lightTheme ? 'light' : 'dark',
        primary: {
          main: primaryColor
        },
        secondary: {
          main: pink[500]
        }
      },
      overrides: {
        MuiAppBar: {
          colorPrimary: {
            backgroundColor: lightTheme ? primaryColor : grey[800]
          }
        }
      }
    })
  }, [lightTheme])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Header
          lightTheme={lightTheme}
          // @ts-expect-error
          setLightTheme={setLightTheme}
        />
        <main className={classes.main}>
          {props.children}
        </main>
    </ThemeProvider>
  )
}
