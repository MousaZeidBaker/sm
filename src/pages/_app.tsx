import type { AppProps } from 'next/app'
import { AmplifyAuthenticator, AmplifyAuthContainer } from '@aws-amplify/ui-react'
import React from 'react'
import useSession from '../components/useSession'
import { withStyles } from '@material-ui/core'
import { SnackbarProvider } from 'notistack'
import { createTheme, ThemeProvider, CssBaseline, Theme } from '@material-ui/core'
import { PaletteMode } from '@mui/material'
import { pink, grey } from '@material-ui/core/colors'

const primaryColor = process.env.NEXT_PUBLIC_APP_PRIMARY_COLOR || '#2196f3'

/**
  * Retrieve item from from local storage
  * 
  * @param {string} key The key of the item to retrieve from local storage
  * @returns {string} Value associated with the given key if key found, null otherwise.
  */
function getItemFromLocalStorage (key: string): string | null {
  return (typeof window !== 'undefined') ? localStorage.getItem(key) : null
}

export const AmplifyAuthenticatorWithStyle = withStyles(({
  '@global': {
    ':root': {
      '--amplify-primary-color': primaryColor,
      '--amplify-primary-tint': '#64b5f6',
      '--amplify-primary-shade': '#1976d2'
    }
  }
}))(AmplifyAuthenticator)

export const ThemeContext = React.createContext({ togglePaletteMode: () => {}, paletteMode: 'light' })

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  // Load the session component in order to setup auth functionality
  const { session } = useSession()

  // Remove the server-side injected CSS
  React.useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }
  }, [])

  const initialPaletteMode = getItemFromLocalStorage('themePaletteMode') as PaletteMode || 'light'
  const [paletteMode, setPaletteMode] = React.useState<PaletteMode>(initialPaletteMode)
  const togglePaletteMode = React.useMemo(() => {
    return () => {
      setPaletteMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
    }
  }, [paletteMode])

  // Update the theme only if the mode changes
  const theme: Theme = React.useMemo(() => {
    return createTheme({
      palette: {
        type: paletteMode,
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
            backgroundColor: (paletteMode === 'light') ? primaryColor : grey[800]
          }
        }
      }
    })
  }, [paletteMode])

  return (
    <ThemeContext.Provider value={{togglePaletteMode, paletteMode}}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
          <AmplifyAuthContainer>
          <AmplifyAuthenticatorWithStyle>
            <SnackbarProvider maxSnack={3}>
              {session && <>
                  <Component {...pageProps} />
              </>}
            </SnackbarProvider>
          </AmplifyAuthenticatorWithStyle>
        </AmplifyAuthContainer>
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}
