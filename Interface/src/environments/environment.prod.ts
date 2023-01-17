export const environment = {
  production: true,
  bridge_url: 'http://localhost:3000', // URL of the bridge
  MSAL_clientId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Application (client) ID from the app registration
  MSAL_authority: 'https://login.microsoftonline.com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Tenant ID from the app registration
  MSAL_redirectUri: 'http://localhost:4200', // This is your redirect URI - Should be the URL of the homepage
  MS_graphEndpoint: 'https://graph.microsoft.com' // This is Microsoft Graph API endpoint -- Should not be modified
};
