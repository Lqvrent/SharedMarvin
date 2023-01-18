import { ActivatedRoute } from '@angular/router'
import { Component, OnInit } from '@angular/core'
import { HttpService } from '../http.service'
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

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
  chartTests: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  }
  chartCoverage: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  }
  chartsOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.dataset.label + ': ' + context.parsed.y + '%';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 10,
          callback: function (value, index, values) {
            return value + '%';
          }
        },
      }
    }
  }
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
          if (this.data.builds.length > 1)
            this.updateCharts()
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
      if (this.data.builds.length > 1)
        this.updateCharts()
      this.endRequest()
    }, (error) => {
      this.module = ""
      this.project = ""
      this.loading = false
    })
  }

  updateCharts() {
    // TESTS PASSED
    this.chartTests.labels = this.data.builds.map(build => '#' + build.build_number).reverse()
    this.chartTests.datasets = [{
      label: 'Tests passed',
      data: this.data.builds.map(build => build.build_summary.tests_passed).reverse(),
      fill: true,
      tension: 0.5,
      borderColor: 'rgba(0,255,0,0.3)',
      backgroundColor: 'rgba(0,255,0,0.3)',
      pointBackgroundColor: 'rgb(0,255,0)',
      pointBorderColor: 'rgb(0,255,0)',
      pointHoverBackgroundColor: 'rgb(0,255,0)',
      pointHoverBorderColor: 'rgb(0,255,0)'
    }]
    // COVERAGE
    this.chartCoverage.labels = this.data.builds.map(build => '#' + build.build_number).reverse()
    this.chartCoverage.datasets = [{
      label: 'Lines',
      data: this.data.builds.map(build => build.build_summary.cov_lines).reverse(),
      fill: true,
      tension: 0.5,
      borderColor: 'rgba(0,0,255,0.3)',
      backgroundColor: 'rgba(0,0,255,0.3)',
      pointBackgroundColor: 'rgb(0,0,255)',
      pointBorderColor: 'rgb(0,0,255)',
      pointHoverBackgroundColor: 'rgb(0,0,255)',
      pointHoverBorderColor: 'rgb(0,0,255)'
    }, {
      label: 'Branches',
      data: this.data.builds.map(build => build.build_summary.cov_branches).reverse(),
      fill: true,
      tension: 0.5,
      borderColor: 'rgba(255,0,0,0.3)',
      backgroundColor: 'rgba(255,0,0,0.3)',
      pointBackgroundColor: 'rgb(255,0,0)',
      pointBorderColor: 'rgb(255,0,0)',
      pointHoverBackgroundColor: 'rgb(255,0,0)',
      pointHoverBorderColor: 'rgb(255,0,0)'
    }]
  }
}
