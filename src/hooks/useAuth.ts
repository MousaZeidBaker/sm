import { HubCallback } from "@aws-amplify/core/lib/Hub";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify, Auth, Hub } from "aws-amplify";
import React from "react";

Amplify.configure({
  ssr: true,
  aws_project_region: process.env.NEXT_PUBLIC_APP_AWS_REGION,
  aws_cognito_identity_pool_id: process.env.NEXT_PUBLIC_APP_IDENTITY_POOL_ID,
  aws_cognito_region: process.env.NEXT_PUBLIC_APP_AWS_REGION,
  aws_user_pools_id: process.env.NEXT_PUBLIC_APP_USER_POOL_ID,
  aws_user_pools_web_client_id:
    process.env.NEXT_PUBLIC_APP_USER_POOL_WEB_CLIENT_ID,
  oauth: {}
});
// Amplify.Logger.LOG_LEVEL = 'DEBUG'

export function useAuth() {
  const { user, authStatus } = useAuthenticator((context) => [
    context.user,
    context.authStatus
  ]);
  const [session, setSession] = React.useState(user.getSignInUserSession());

  // Listen to Amplify events with Amplify Hub on component mount
  React.useEffect(() => {
    const listener: HubCallback = ({ payload: { event } }) => {
      // https://docs.amplify.aws/lib/auth/auth-events/q/platform/js/
      switch (event) {
        case "tokenRefresh_failure":
          signOut();
          break;
      }
    };
    Hub.listen("auth", listener);

    // Cleanup function, stop listener
    return (): void => Hub.remove("auth", listener);
  }, []);

  /**
   * Return idToken for current authenticated user, attempt to refresh if
   * invalid, sign out if refreshToken invalid
   *
   * @return {string}
   */
  async function getIdToken(): Promise<string> {
    let idToken = session?.getIdToken().getJwtToken() || "";

    if (!session?.isValid()) {
      // Invalid session, refresh it
      try {
        // Auth.currentSession() will automatically refresh the accessToken and
        // idToken if tokens are expired and a valid refreshToken presented
        // https://docs.amplify.aws/lib/auth/manageusers/q/platform/js/#retrieve-current-session

        const freshSession = await Auth.currentSession();
        setSession(freshSession);
        idToken = freshSession?.getIdToken().getJwtToken();
      } catch {
        signOut();
      }
    }

    return idToken;
  }

  /**
   * Sign out current authenticated user
   *
   * @return {void}
   */
  function signOut(): void {
    setSession(null);
    Auth.signOut();
  }

  /**
   * Change password for current authenticated user
   *
   * @return {Promise<void>}
   */
  const changePassword = async function (
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await Auth.changePassword(user, currentPassword, newPassword);
  };

  return { user, authStatus, getIdToken, signOut, changePassword };
}
