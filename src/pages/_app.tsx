import type { AppProps } from 'next/app'
import { AmplifyAuthenticator, AmplifyAuthContainer } from '@aws-amplify/ui-react'
import React from 'react'
import useSession from '../components/useSession'
import { withStyles } from '@material-ui/core'
import { SnackbarProvider } from 'notistack'

export const AmplifyAuthenticatorWithStyle = withStyles(({
  '@global': {
    ':root': {
      '--amplify-primary-color': process.env.NEXT_PUBLIC_APP_PRIMARY_COLOR || '#2196f3',
      '--amplify-primary-tint': '#64b5f6',
      '--amplify-primary-shade': '#1976d2'
    }
  }
}))(AmplifyAuthenticator)

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

  return (
    <AmplifyAuthContainer>
      <AmplifyAuthenticatorWithStyle>
        <SnackbarProvider maxSnack={3}>
          {session && <>
              <Component {...pageProps} />
          </>}
        </SnackbarProvider>
      </AmplifyAuthenticatorWithStyle>
    </AmplifyAuthContainer>
  )
}
