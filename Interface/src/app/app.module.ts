import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NgChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

import { MsalModule, MsalRedirectComponent, MsalGuard, MsalInterceptor } from '@azure/msal-angular';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { NotFoundComponent } from './not-found/not-found.component';
import { BuildComponent } from './build/build.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyComponent } from './my/my.component';
import { ViewComponent } from './view/view.component';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NotFoundComponent,
    BuildComponent,
    MyComponent,
    ViewComponent
  ],
  imports: [
    BrowserModule,
    NgChartsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    MsalModule.forRoot(new PublicClientApplication({
      auth: {
        clientId: environment.MSAL_clientId, // Application (client) ID from the app registration
        authority: environment.MSAL_authority, // The Azure cloud instance and the app's sign-in audience (tenant ID, common, organizations, or consumers)
        redirectUri: environment.MSAL_redirectUri // This is your redirect URI
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: isIE, // Set to true for Internet Explorer 11
      }
    }), {
      interactionType: InteractionType.Redirect, // MSAL Guard Configuration
      authRequest: {
        scopes: ['user.read']
      }
    }, {
      interactionType: InteractionType.Redirect, // MSAL Interceptor Configuration
      protectedResourceMap: new Map([
        [`${environment.MS_graphEndpoint}/v1.0/me`, ['user.read']],
        [`${environment.bridge_url}/whoami`, ['user.read']],
        [`${environment.bridge_url}/content`, ['user.read']],
        [`${environment.bridge_url}/my`, ['user.read']],
        [`${environment.bridge_url}/trigger`, ['user.read']],
        [`${environment.bridge_url}/view`, ['user.read']],
      ])
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    MsalGuard
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
