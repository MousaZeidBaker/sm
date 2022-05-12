import type { AppProps } from 'next/app'
import { Authenticator, useTheme, View, Text } from '@aws-amplify/ui-react'
import { setupAmplifyListener } from '../components/useSession'
import { IdleAlertDialog } from '../components/useSession'
import { Amplify } from 'aws-amplify'
import '@aws-amplify/ui-react/styles.css'
import React from 'react'
import { SnackbarProvider } from 'notistack'
import { createTheme, ThemeProvider, StyledEngineProvider, CssBaseline, Theme } from '@mui/material'
import { PaletteMode } from '@mui/material'
import { pink } from '@mui/material/colors'
import Typography from '@mui/material/Typography'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import LockIcon from '@mui/icons-material/Lock'
import Head from 'next/head'

Amplify.configure({
  ssr: true,
  'aws_project_region': process.env.NEXT_PUBLIC_APP_AWS_REGION,
  'aws_cognito_identity_pool_id': process.env.NEXT_PUBLIC_APP_IDENTITY_POOL_ID,
  'aws_cognito_region': process.env.NEXT_PUBLIC_APP_AWS_REGION,
  'aws_user_pools_id': process.env.NEXT_PUBLIC_APP_USER_POOL_ID,
  'aws_user_pools_web_client_id': process.env.NEXT_PUBLIC_APP_USER_POOL_WEB_CLIENT_ID,
  'oauth': {}
})
// Amplify.Logger.LOG_LEVEL = 'DEBUG'

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

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

export const ThemeContext = React.createContext({ togglePaletteMode: () => {}, paletteMode: 'light' })

function App({ Component, pageProps }: AppProps): JSX.Element {
  // Remove the server-side injected CSS
  React.useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }
  }, [])

  setupAmplifyListener()

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
        mode: paletteMode,
        primary: {
          main: primaryColor
        },
        secondary: {
          main: pink[500]
        }
      },
    })
  }, [paletteMode])

  return (
    <>
      <Head>
        <title>SecretsManager</title>
        <meta name="description" content="SecretsManager: The secret manager in your hands" />
      </Head>
      <ThemeContext.Provider value={{togglePaletteMode, paletteMode}}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <CssBaseline />
              <SnackbarProvider maxSnack={3}>
                <IdleAlertDialog/>
                <Component {...pageProps} />
              </SnackbarProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      </ThemeContext.Provider>
    </>
  )
}

export default function (props: AppProps): JSX.Element {
  const amplifyComponents = {
    Header() {
      const { tokens } = useTheme();

      return (
        <View textAlign="center" padding={tokens.space.large}>
          <VpnKeyIcon fontSize="large"/>
          <LockIcon fontSize="large"/>
          <Typography variant="h5">
            Sign in to SecretsManager
          </Typography>
        </View>
      )
    },
    Footer() {
      const { tokens } = useTheme();
  
      return (
        <View textAlign="center" padding={tokens.space.large}>
          <Text color={`${tokens.colors.neutral['80']}`}>
            &copy; All Rights Reserved
          </Text>
        </View>
      )
    },
  }

  return (
    <>
      <Authenticator hideSignUp={true} components={amplifyComponents}>
        <App {...props}/>
      </Authenticator>
    </>
  )
}
