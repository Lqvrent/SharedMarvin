// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  bridge_url: 'http://localhost:3000', // URL of the bridge
  MSAL_clientId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Application (client) ID from the app registration
  MSAL_authority: 'https://login.microsoftonline.com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Tenant ID from the app registration
  MSAL_redirectUri: 'http://localhost:4200', // This is your redirect URI - Should be the URL of the homepage
  MS_graphEndpoint: 'https://graph.microsoft.com' // This is Microsoft Graph API endpoint -- Should not be modified
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
