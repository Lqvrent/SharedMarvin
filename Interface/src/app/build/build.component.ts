import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { environment } from 'src/environments/environment'
import { HttpService } from '../http.service'

@Component({
  selector: 'app-build',
  templateUrl: './build.component.html',
  styleUrls: ['./build.component.less']
})
export class BuildComponent implements OnInit {
  triggerForm: FormGroup
  loading: boolean = true
  loaded: number = 0
  data = {
    modules: [
      {
        name: '',
        projects: [{ name: '', description: '' }]
      }
    ],
    whoami: {
      identity: '',
      key: '',
      lastTrigger: '',
      name: '',
      nextTrigger: ''
    },
    bridgeUrl: environment.bridge_url
  }

  constructor(
    private httpService: HttpService
  ) {
    this.triggerForm = new FormGroup({
      module: new FormControl(null, Validators.required),
      project: new FormControl(null, Validators.required),
      file: new FormControl(null, Validators.required),
      fileSource: new FormControl(null, Validators.required),
    })
  }

  endRequest(): void {
    this.loaded += 1
    if (this.loaded === 2) {
      this.triggerForm.enable()
      this.loading = false
      const module = this.data.modules.find(module => module.name === localStorage.getItem("build_module"))
      if (module) {
        this.triggerForm.controls["module"].setValue(module.name)
        const project = module.projects.find(project => project.name === localStorage.getItem("build_project"))
        if (project)
          this.triggerForm.controls["project"].setValue(project.name)
      }
    }
  }

  ngOnInit(): void {
    this.triggerForm.disable()
    this.httpService.content().subscribe((data: any) => {
      this.data.modules = data.data.modules
      this.endRequest()
    })
    this.httpService.whoami().subscribe((data: any) => {
      this.data.whoami = data.data
      this.endRequest()
    })
  }

  onSubmit(): void {
    const response = document.getElementById("response")

    if (this.triggerForm.valid) {
      this.triggerForm.disable()
      this.httpService.trigger(this.triggerForm.value.module, this.triggerForm.value.project, this.triggerForm.value.fileSource).subscribe((data: any) => {
        this.httpService.whoami().subscribe((data: any) => {
          this.triggerForm.enable()
          this.data.whoami = data.data
          localStorage.setItem("build_module", this.triggerForm.value.module)
          localStorage.setItem("build_project", this.triggerForm.value.project)
          if (response)
            response.innerHTML = `<div class="alert alert-success alert-dismissible show" role="alert">
            <strong>Success!</strong> Your build has been triggered. You will have your result in a few minutes.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`
        })
      }, (error: any) => {
        this.triggerForm.enable()
        if (response)
          response.innerHTML = `<div class="alert alert-danger alert-dismissible show" role="alert">
          <strong>Error!</strong> ${error.error.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`
      })
    }
    // create an closable bootstrap alert in #response
    if (response) {
      response.innerHTML = `<div class="alert alert-info alert-dismissible show" role="alert">
        Sending your request...
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`
    }
  }

  currentProjects(): string[] {
    const projects = this.data.modules.find(module => module.name === this.triggerForm.value.module)?.projects.map(project => project.name) || []
    if (this.triggerForm.enabled)
      projects.length > 0 ? this.triggerForm.controls["project"].enable() : this.triggerForm.controls["project"].disable()
    return projects
  }

  changeModule(event: Event): void {
    this.triggerForm.controls["project"].setValue(null)
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement
    if (target.files?.length === 1) {
      this.triggerForm.controls["fileSource"].setValue(target.files[0])
    }
  }

  copyKey(): void {
    navigator.clipboard.writeText(this.data.whoami.key)
  }

  resetKey(): void {
    this.loading = true
    this.httpService.whoami(true).subscribe((data: any) => {
      this.data.whoami = data.data
      this.loading = false
    })
  }

  nextTrigger(): string {
    const nextTrigger = new Date(this.data.whoami.nextTrigger)
    const now = new Date()
    const diff = nextTrigger.getTime() - now.getTime()
    if (diff > 0) {
      setTimeout(() => this.nextTrigger(), 1000)
      return `Please wait ${Math.floor(diff / 1000)} seconds before triggering again.`
    }
    this.data.whoami.nextTrigger = ""
    return `Trigger`
  }
}
