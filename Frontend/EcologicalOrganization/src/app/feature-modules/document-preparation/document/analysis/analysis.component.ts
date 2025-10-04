import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import { ProjectService } from '../../service/project.service';
import { DocumentService } from '../../service/document.service';
import { DocumentAnalysis } from '../../model/implementation/analysis-impl.model';
import { Router } from '@angular/router';
import { IDocumentBase } from '../../model/interface/document.model';
import { IDocumentBoard } from '../../model/interface/document.model';
import { IAnalysis } from '../../model/interface/analysis.model';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js/dist/types/index';
import { AfterViewInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'document-preparation-document-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class DocumentPreparationDocumentAnalysisComponent implements OnInit {
  documentId!: number;
  document: IDocumentBoard;
  analysis: IAnalysis;
  graphHeight!:string;
  pieChartLabels!: string[];
  pieChartData!: number[]
  @ViewChild('containerRef') containerRef!: ElementRef<HTMLDivElement>;

  constructor(private route: ActivatedRoute, private documentService: DocumentService) { }

  ngAfterViewInit(): void {
   const height = this.containerRef.nativeElement.offsetHeight;
    this.graphHeight = `${(height-24)*0.9}px`;
  }

  ngOnInit(): void {
        this.route.paramMap.subscribe(async params => {
          this.documentId = Number(params.get('id'));
          this.getAnalysis();

        });
  }
  loadPieChartData(): void {
    this.pieChartLabels = this.getLabels();
    this.pieChartData = this.getData();
  }

  getAnalysis(): void {
    this.documentService.getDocumentAnalysis(this.documentId).subscribe(analysis => {
      this.analysis = analysis;
      this.loadPieChartData();
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

}
