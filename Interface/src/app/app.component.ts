import { Component, OnInit, OnDestroy, Inject } from '@angular/core'
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular'
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser'
import { Subject } from 'rxjs'
import { filter, takeUntil } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import { HttpService } from './http.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Interface'
  isIframe = false
  loginDisplay = false
  loading: boolean = true
  private readonly _destroying$ = new Subject<void>()
  data = {
    modules: [
      {
        name: '',
        projects: [{ name: '', description: '' }]
      }
    ]
  }

  constructor(
    @Inject(MSAL_GUARD_CONFIG)
    private msalGuardConfig: MsalGuardConfiguration,
    private broadcastService: MsalBroadcastService,
    private authService: MsalService,
    private httpService: HttpService
  )
  { }

  ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener

    this.broadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay()
      })
  }

  login() {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest)
    } else {
      this.authService.loginRedirect()
    }
  }

  logout() {
    this.authService.logoutRedirect({
      postLogoutRedirectUri: environment.MSAL_redirectUri
    })
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0
    if (this.loginDisplay) {
      this.httpService.content().subscribe((data: any) => {
        this.data = data.data
        this.loading = false
      })
    }
  }

  toggleSidebar(): void {
    const sidebar = document.getElementById('sidebar')
    if (sidebar)
      sidebar.classList.toggle('show')
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined)
    this._destroying$.complete()
  }
}
