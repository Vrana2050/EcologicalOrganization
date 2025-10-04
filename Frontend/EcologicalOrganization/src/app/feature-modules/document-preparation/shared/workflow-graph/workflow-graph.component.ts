import { Component } from '@angular/core';
import { IWorkflow } from '../../model/interface/workflow.model';
import { Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { Core } from 'cytoscape';
import { AfterViewInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import cytoscape from 'cytoscape';
import cytoscapeDagre from 'cytoscape-dagre';
(cytoscape as any).use(cytoscapeDagre);

@Component({
  selector: 'document-preparation-workflow-graph',
  templateUrl: './workflow-graph.component.html',
  styleUrls: ['./workflow-graph.component.css']
})
export class DocumentPreparationWorkflowGraphComponent implements  AfterViewInit,OnDestroy {
  @Input() workflow: IWorkflow;
  @Input() height: number;
  cy!: Core;
  elements: any[] = [];
  @ViewChild('cyContainer', { static: true }) cyContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    this.initializeGraph();
    this.initCytoscape();
  }
  initializeGraph(): void {
    this.workflow.sortStatuses();
    const colors = this.generateStatusColors(this.workflow.statuses.length);
    for(const status of this.workflow.statuses){
      const color = colors[this.workflow.statuses.indexOf(status)];
      this.elements.push({ data: { id: status.id, label: status.currentStatus.name, color:color}, classes: 'status-node' });
      if(status.nextWorkflowStatusId){
        this.elements.push({ data: { source: status.id, target: status.nextWorkflowStatusId }, classes: 'next-edge' });
      }
      if(status.deniedWorkflowStatusId){
        this.elements.push({ data: { source: status.id, target: status.deniedWorkflowStatusId }, classes: 'denied-edge' });
      }
    }
  }

generateStatusColors(count: number): string[] {
  const colors: string[] = [];
  const step = 360 / count;

  for (let i = 0; i < count; i++) {
    const hue = Math.round(i * step);
    const saturation = 70;
    const lightness = 45;
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
}
   private initCytoscape() {
     this.cy = cytoscape({
       container: this.cyContainer.nativeElement,
       elements: this.elements,
       style: [
         {
           selector: '.status-node',
           style: {
             shape: 'round-rectangle',
             width: 200,
             height: 60,
             'background-color': 'data(color)',
             label: 'data(label)',
             'text-valign': 'center',
             'text-halign': 'center',
             'text-wrap': 'ellipsis',
             'text-max-width': '180',
             color: '#fff',
             'font-size': 28,
             'border-width': 2,
             'border-color': 'data(color)',
           },
         },
         {
           selector: '.next-edge',
           style: {
             width: 2,
             'line-color': '#26A69A',
             'target-arrow-color': '#26A69A',
             'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
               'control-point-step-size': 0,

           },
         },
         {
           selector: '.denied-edge',
           style: {
             width: 2,
             'line-color': 'red',
             'target-arrow-color': 'red',
             'target-arrow-shape': 'triangle',
             'curve-style': 'bezier',
             'control-point-step-size': 120,      // visina zakrivljenja
              'control-point-distances': [80],     // pomak kontrolne tačke (udaljenost od osnovne linije)
              'control-point-weights': [0.25],
              'edge-distances': 'node-position',
           },
         },
       ],
       layout: {
         name: 'dagre',
         rankDir: 'LR', // Left-to-Right (vodoravno)
         nodeSep: 40, // razmak između čvorova
         rankSep: 40 // razmak između "nivoa"
       } as any,
      userZoomingEnabled: false,    // ❌ zabrani zoom (scroll, pinch)
      userPanningEnabled: false,    // ❌ zabrani pomeranje grafa
      boxSelectionEnabled: false,   // ❌ zabrani pravougaono selektovanje
      autoungrabify: true,
     },
    );
   }
  ngOnDestroy(): void {
    if (this.cy) {
      this.cy.destroy();
      this.cy = undefined!;
    }
  }

}
