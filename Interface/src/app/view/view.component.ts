import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.less']
})
export class ViewComponent implements OnInit {
  module: string = ""
  project: string = ""
  build: number = 0
  loading: boolean = true
  loaded: number = 0
  // create a tabs array of objects of type {name: string, content: string}
  tabs: {name: string, content: string}[] = []
  data = {
    project_description: '',
    build_start_time: 0,
    coding_style_major: new Array<string>(),
    coding_style_minor: new Array<string>(),
    coding_style_info: new Array<string>(),
    coding_style_other: new Array<string>(),
    coverage: {
      branches: "",
      lines: ""
    },
    build_logs: "",
    summary: {
      bad_status: new Array<string>(),
      tests_passed: 0,
      cov_lines: 0,
      cov_branches: 0,
      style_major: 0,
      style_minor: 0,
      style_info: 0,
    },
    skills: [
      {
        name: "",
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        tests: [
          {
            name: "",
            status: "",
            message: "",
          }
        ]
      }
    ],
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

  processTabs(): void {
    this.tabs = []
    if (this.data.summary.bad_status.includes("Build failed"))
      this.tabs.push({ name: 'Build logs', content: this.data.build_logs })
    if (this.data.coding_style_major.length > 0)
      this.tabs.push({ name: 'Major', content: this.data.coding_style_major.join('<br />') })
    if (this.data.coding_style_minor.length > 0)
      this.tabs.push({ name: 'Minor', content: this.data.coding_style_minor.join('<br />') })
    if (this.data.coding_style_info.length > 0)
      this.tabs.push({ name: 'Info', content: this.data.coding_style_info.join('<br />') })
    if (this.data.coding_style_other.length > 0)
      this.tabs.push({ name: 'Others', content: this.data.coding_style_other.join('<br />') })
    if (!this.data.summary.bad_status.includes("Build failed"))
      this.tabs.push({ name: 'Build logs', content: this.data.build_logs })
    if (this.data.coverage?.lines || this.data.coverage?.branches)
      this.tabs.push({
        name: 'Coverage',
        content: this.data.coverage.lines.replace(/\n/g, '<br />') + '<br />' + this.data.coverage.branches.replace(/\n/g, '<br />')
      })
  }

  ngOnInit(): void {
    this.module = ""
    this.project = ""
    this.loading = true
    this.loaded = 0
    this.route.queryParamMap
      .subscribe((params: any) => {
        this.module = params.get('module') || ""
        this.project = params.get('project') || ""
        this.build = parseInt(params.get('build') || "0")
        this.httpService.view(this.module, this.project, this.build).subscribe((data: any) => {
          this.data = data.data
          this.processTabs()
          this.endRequest()
        }, (error: any) => {
          this.module = ""
          this.project = ""
          this.build = 0
          this.loading = false
        })
      })
  }

}
