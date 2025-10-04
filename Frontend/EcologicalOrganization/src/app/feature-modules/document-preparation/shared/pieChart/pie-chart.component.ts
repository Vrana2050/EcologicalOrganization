import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements AfterViewInit, OnDestroy,OnChanges {
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() title: string = 'Pie Chart';

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  private renderChart() {
    if (!this.chartCanvas) {
    return; // ako canvas još nije dostupan, samo prekini
  }
    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: this.labels,
        datasets: [{
          data: this.data,
          backgroundColor: [
            '#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0',
            '#00BCD4', '#8BC34A', '#FF9800', '#795548', '#607D8B'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // da koristimo fiksne dimenzije iz CSS-a
        plugins: {
          legend: {
            position: 'left',
          },
          title: {
            display: true,
            text: this.title,
            font: { size: 18 }
          }
        }
      }
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
  private updateChart() {
    if (this.chart) {
      this.chart.data.labels = this.labels;
      this.chart.data.datasets[0].data = this.data;
      this.chart.update();
    } else {
      this.renderChart();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {

    if (changes['labels'] || changes['data']) {
      this.updateChart();
    }
  }
}
