#!/bin/bash

# Exit when any command fails
set -e

# Make sure environment variables are set
[ -z "$AWS_DEFAULT_REGION" ] && echo "Environment Variable AWS_DEFAULT_REGION must be set" && exit
[ -z "$AWS_ACCESS_KEY_ID" ] && echo "Environment Variable AWS_ACCESS_KEY_ID must be set" && exit
[ -z "$AWS_SECRET_ACCESS_KEY" ] && echo "Environment Variable AWS_SECRET_ACCESS_KEY must be set" && exit

# Make sure jq is properly installed
echo -n "Using jq version: "
jq --version

# Make sure AWS credentials are properly set
echo -n "Getting caller idenity: "
aws sts get-caller-identity | jq -r ".Arn"

# ID to be used to postfix and tag resources
echo -n "Generating random ID: "
RANDOM_ID=$(openssl rand -hex 6)
echo "$RANDOM_ID"

# Create tmp folder
SOURCE="${BASH_SOURCE%/*}"
mkdir -p "${SOURCE}/tmp"

# Create user-pool
# https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cognito-idp/create-user-pool.html
echo "Creating user-pool"
aws cognito-idp create-user-pool \
  --pool-name "sm_user_pool_$RANDOM_ID" \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=false,RequireLowercase=false,RequireNumbers=false,RequireSymbols=false}" \
  --auto-verified-attributes "email" \
  --alias-attributes "email" "preferred_username" \
  --admin-create-user-config "AllowAdminCreateUserOnly=True" \
  --schema "Name=email,Required=True" \
  --username-configuration "CaseSensitive=False" \
  --account-recovery-setting "RecoveryMechanisms=[{Priority=1,Name=verified_email}]" \
  --user-pool-tags "id=$RANDOM_ID" \
  > "${SOURCE}/tmp/response.txt"

USER_POOL_ID=$(cat "${SOURCE}/tmp/response.txt" | jq -r ".[].Id")

# Configuration user pool multi-factor authentication (MFA)
# https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cognito-idp/set-user-pool-mfa-config.html
echo "Configuraring user-pool multi-factor authentication (MFA)"
aws cognito-idp set-user-pool-mfa-config \
  --user-pool-id "$USER_POOL_ID" \
  --software-token-mfa-configuration "Enabled=True" \
  --mfa-configuration "ON" \
  > "${SOURCE}/tmp/response.txt"

# Create user-pool client
# https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cognito-idp/create-user-pool-client.html
echo "Creating user-pool client"
aws cognito-idp create-user-pool-client \
  --user-pool-id "$USER_POOL_ID" \
  --client-name "sm_web_client_$RANDOM_ID" \
  --no-generate-secret \
  --refresh-token-validity 60 \
  --access-token-validity 60 \
  --id-token-validity 60 \
  --token-validity-units "AccessToken=minutes,IdToken=minutes,RefreshToken=minutes" \
  --prevent-user-existence-errors "ENABLED" \
  > "${SOURCE}/tmp/response.txt"

USER_POOL_WEB_CLIENT_ID=$(cat "${SOURCE}/tmp/response.txt" | jq -r ".UserPoolClient.ClientId")

# Create identity-pool
# https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cognito-identity/create-identity-pool.html
echo "Creating identity-pool"
aws cognito-identity create-identity-pool \
  --identity-pool-name "sm_identity_pool_$RANDOM_ID" \
  --no-allow-unauthenticated-identities \
  --cognito-identity-providers "ProviderName=\"cognito-idp.eu-central-1.amazonaws.com/$USER_POOL_ID\",ClientId=\"$USER_POOL_WEB_CLIENT_ID\",ServerSideTokenCheck=false" \
  --identity-pool-tags "id=$RANDOM_ID" \
  > "${SOURCE}/tmp/response.txt"

IDENTITY_POOL_ID=$(cat "${SOURCE}/tmp/response.txt" | jq -r ".IdentityPoolId")

# Configuere trust-policy.json file with the identity-pool id
echo "Updating trust-policy.json"
cat "${SOURCE}/trust-policy.json" | jq -r \
  '.Statement[].Condition.StringEquals."cognito-identity.amazonaws.com:aud"=$identityPoolId' \
  --arg identityPoolId "$IDENTITY_POOL_ID" \
  > "${SOURCE}/tmp/trust-policy.json"

# Configuere policy.json file with the identity-pool id
echo "Updating policy.json"
cat "${SOURCE}/policy.json" | \
  # Configure condition
  jq -r   '.Statement[].Condition.StringEquals."cognito-identity.amazonaws.com:aud"=$identityPoolId' \
  --arg identityPoolId "$IDENTITY_POOL_ID" | \
  # Configure resource
  jq -r   '.Statement[].Resource=$resource' \
  --arg resource "arn:aws:ssm:$AWS_DEFAULT_REGION:*:parameter/sm/*" \
  > "${SOURCE}/tmp/policy.json"

# Create IAM role
# https://awscli.amazonaws.com/v2/documentation/api/latest/reference/iam/create-role.html
echo "Creating IAM role"
aws iam create-role \
  --role-name "sm_auth_role_$RANDOM_ID" \
  --assume-role-policy-document "file://${SOURCE}/tmp/trust-policy.json" \
  --tags "Key=id,Value=$RANDOM_ID" \
  > "${SOURCE}/tmp/response.txt"

ROLE_ARN=$(cat "${SOURCE}/tmp/response.txt" | jq -r ".Role.Arn")
ROLE_NAME=$(cat "${SOURCE}/tmp/response.txt" | jq -r ".Role.RoleName")

# Add an inline policy document to the IAM role
# https://awscli.amazonaws.com/v2/documentation/api/latest/reference/iam/put-role-policy.html
echo "Adding policy document to the IAM role"
aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "sm_auth_role_policy_$RANDOM_ID" \
  --policy-document "file://${SOURCE}/tmp/policy.json" \
  > "${SOURCE}/tmp/response.txt"

# Set the roles for the identity pool
# https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cognito-identity/set-identity-pool-roles.html
echo "Setting IAM role for the identity-pool"
aws cognito-identity set-identity-pool-roles \
  --identity-pool-id "$IDENTITY_POOL_ID" \
  --roles authenticated="$ROLE_ARN" \
  > "${SOURCE}/tmp/response.txt"

# Print neccessary variables
echo "{\"USER_POOL_ID\":\"$USER_POOL_ID\", \"USER_POOL_WEB_CLIENT_ID\":\"$USER_POOL_WEB_CLIENT_ID\", \"IDENTITY_POOL_ID\":\"$IDENTITY_POOL_ID\"}" | jq -r "."
