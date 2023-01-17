import { ActivatedRoute } from '@angular/router'
import { Component, OnInit } from '@angular/core'
import { HttpService } from '../http.service'

@Component({
  selector: 'app-my',
  templateUrl: './my.component.html',
  styleUrls: ['./my.component.less']
})
export class MyComponent implements OnInit {
  module: string = ""
  project: string = ""
  loading: boolean = true
  loaded: number = 0
  data = {
    project_description: '',
    builds: [
      {
        build_number: 0,
        build_start_time: 0,
        build_summary: {
          bad_status: [],
          tests_passed: 0,
          cov_lines: 0,
          cov_branches: 0,
          style_major: 0,
          style_minor: 0,
          style_info: 0,
        }
      }
    ]
  }

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService
  ) { }

  endRequest(): void {
    this.loaded += 1
    if (this.loaded === 1) {
      this.loading = false
    }
  }

  ngOnInit(): void {
    this.module = ""
    this.project = ""
    this.loading = true
    this.loaded = 0
    this.route.queryParamMap
      .subscribe((params) => {
        this.module = params.get('module') || ""
        this.project = params.get('project') || ""
        this.httpService.my(this.module, this.project).subscribe((data: any) => {
          this.data = data.data
          this.endRequest()
        }, (error) => {
          this.module = ""
          this.project = ""
          this.loading = false
        })
      }
    )
  }

  refresh() {
    this.loading = true
    this.loaded = 0
    this.httpService.my(this.module, this.project).subscribe((data: any) => {
      this.data = data.data
      this.endRequest()
    }, (error) => {
      this.module = ""
      this.project = ""
      this.loading = false
    })
  }

}
