import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private bridgeUrl: string = environment.bridge_url
  private endpoint: string = environment.MS_graphEndpoint

  constructor(
    private http: HttpClient
  ) { }

  whoami(reset: boolean = false) {
    return this.http.get(`${this.bridgeUrl}/whoami${ reset ? '?reset' : '' }`).pipe()
  }

  content() {
    return this.http.get(`${this.bridgeUrl}/content`).pipe()
  }

  my(module: string, project: string) {
    return this.http.get(`${this.bridgeUrl}/my?module=${module}&project=${project}`).pipe()
  }

  trigger(module: string, project: string, file: any) {
    const formData = new FormData()
    formData.append('module', module)
    formData.append('project', project)
    formData.append('file', file)
    return this.http.post(`${this.bridgeUrl}/trigger`, formData).pipe()
  }

  view(module: string, project: string, build: number) {
    return this.http.get(`${this.bridgeUrl}/view?module=${module}&project=${project}&build=${build}`).pipe()
  }
}
