import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserUtils } from '@azure/msal-browser';
import { MsalGuard } from '@azure/msal-angular';

import { HomeComponent } from './home/home.component';
import { BuildComponent } from './build/build.component';
import { MyComponent } from './my/my.component';
import { ViewComponent } from './view/view.component';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'build',
    component: BuildComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'my',
    component: MyComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'view',
    component: ViewComponent,
    canActivate: [MsalGuard]
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

const isIframe = window !== window.parent && !window.opener;

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // Don't perform initial navigation in iframes or popups
    initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() ? 'enabledNonBlocking' : 'disabled' // Set to enabledBlocking to use Angular Universal
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
