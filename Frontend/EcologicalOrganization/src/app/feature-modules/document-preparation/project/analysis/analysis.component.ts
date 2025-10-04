import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import { ProjectService } from '../../service/project.service';
import { IAnalysis } from '../../model/interface/analysis.model';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js/dist/types/index';
import { AfterViewInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import jsPDF from 'jspdf';
import { GraphAnalysisComponent } from '../../shared/analysis/analysis.component';

@Component({
  selector: 'document-preparation-project-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class DocumentPreparationProjectAnalysisComponent implements OnInit, AfterViewInit {
  projectId!: number;
  analysis: IAnalysis;
  graphHeight!:string;
  @ViewChild('containerRef') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild(GraphAnalysisComponent) graphComponent!: GraphAnalysisComponent;

  constructor(private route: ActivatedRoute, private projectService: ProjectService) { }

  ngAfterViewInit(): void {
   const height = this.containerRef.nativeElement.offsetHeight;
    this.graphHeight = `${(height-24)*0.9}px`;
  }

  ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
          this.projectId = Number(params.get('id'));
        });
        this.getAnalysis();
  }

  getAnalysis(): void {
    this.projectService.getProjectAnalysis(this.projectId).subscribe(analysis => {
      this.analysis = analysis;
    });
  }
  getLabels(): string[] {
    return this.analysis.entityDurationByStatus.map(status => status.name);
  }

  getData(): number[] {
    return this.analysis.entityDurationByStatus.map(status => status.durationDays);
  }
   get greenWidth(): string {
    return Math.min(this.analysis.entityDeadlinePercentage, 100) + '%';
  }

  get redWidth(): string {
    return this.analysis.entityDeadlinePercentage > 100 ? (this.analysis.entityDeadlinePercentage - 100) + '%' : '0%';
  }
  get topRightLabel(): string {
    return this.analysis.entityDeadlinePercentage > 100 ? 'End' : 'Due date';
  }

  get aboveGreenLabel(): string {
    return this.analysis.entityDeadlinePercentage > 100 ? 'Due date' : 'End';
  }
  exportToPdf() {
    this.graphComponent.exportToPdf();
  }
}
