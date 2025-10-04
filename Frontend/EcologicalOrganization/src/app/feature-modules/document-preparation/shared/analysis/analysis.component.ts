import { Component, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IDocumentAnalysis } from '../../model/interface/analysis.model';
import { Core } from 'cytoscape';
import cytoscape from 'cytoscape';
import cytoscapePopper from 'cytoscape-popper';
import { createPopper } from '@popperjs/core';
import { IStatusDuration } from '../../model/interface/analysis.model';
import { computePosition, flip, shift, limitShift } from '@floating-ui/dom';
import cytoscapeDagre from 'cytoscape-dagre';
import jsPDF from 'jspdf';
import tippy from 'tippy.js';

// ✅ factory za popper
function popperFactory(ref: any, content: HTMLElement, opts?: any) {
  const popperOptions = {
    middleware: [flip(), shift({ limiter: limitShift() })],
    ...opts,
  };

  function update() {
    computePosition(ref, content, popperOptions).then(({ x, y }) => {
      Object.assign(content.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  }

  update();
  return { update };
}

// registracija plugina
(cytoscape as any).use(cytoscapePopper(popperFactory));
(cytoscape as any).use(cytoscapeDagre);
@Component({
  selector: 'document-preparation-graph-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css'],
})
export class GraphAnalysisComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() analyses: IDocumentAnalysis[];
  @Input() entityDeadlinePercentage: number;
  @Input() height: string = '500px';
  private cy!: Core;
  elements: any[] = [{ data: { id: 'start', label: 'Start' }, classes: 'start-node' }];

  constructor(private router: Router) {}

  initializeGraph(): void {
    for (const analysis of this.analyses) {
      if (analysis.dependentDocuments?.length > 0) {
        for (const dependentDoc of analysis.dependentDocuments) {
          this.elements.push({ data: { source: dependentDoc.id, target: analysis.document.id } });
        }
      } else {
        this.elements.push({ data: { source: 'start', target: analysis.document.id } });
      }

      if (
        this.analyses.find(a => a.dependentDocuments?.some(doc => doc.id === analysis.document.id)) == null
      ) {
        this.elements.push({ data: { source: analysis.document.id, target: 'end' } });
      }

      this.elements.push({
        data: {
          id: analysis.document.id,
          label: analysis.document.name,
          deadlinePercentage: analysis.deadlinePercentage,
          returnCount: analysis.returnCount,
          durationByStatus: analysis.durationByStatus,
          color: this.getColorForDeadline(analysis.deadlinePercentage),
        },
      });
    }

    this.elements.push({
      data: { id: 'end', label: 'End', color: this.getColorForDeadline(this.entityDeadlinePercentage) },
      classes: 'end-node',
    });
  }

  getColorForDeadline(deadlinePercentage: number): string {
    if (deadlinePercentage <= 100) {
      const ratio = deadlinePercentage / 100;
      const r = Math.round(165 - ratio * (165 - 27));
      const g = Math.round(214 - ratio * (214 - 94));
      const b = Math.round(167 - ratio * (167 - 32));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const ratio = Math.min(1, (deadlinePercentage - 100) / 100);
      const r = Math.round(255 - ratio * (255 - 183));
      const g = Math.round(82 - ratio * (82 - 28));
      const b = Math.round(82 - ratio * (82 - 28));
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  ngAfterViewInit(): void {
    this.initializeGraph();
    this.initCytoscape();
    this.registerEvents();
  }

  ngOnDestroy(): void {
    if (this.cy) {
      this.cy.destroy();
      this.cy = undefined!;
    }
  }

  private initCytoscape() {
    this.cy = cytoscape({
      container: document.getElementById('cy'),
      elements: this.elements,
      style: [
        {
          selector: 'node',
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
            'font-size': 14,
            'border-width': 2,
            'border-color': '#333',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#999',
            'target-arrow-color': '#999',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
        {
          selector: '.start-node',
          style: {
            shape: 'round-rectangle',
            'background-color': '#4CAF50',
            color: '#fff',
          },
        },
        {
          selector: '.end-node',
          style: {
            shape: 'round-rectangle',
            'background-color': 'data(color)',
            color: '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            width: '200px',
            'text-wrap': 'ellipsis',
          },
        },
      ],
      layout: {
        name: 'dagre',
        rankDir: 'TB',
        padding: 10
      } as any,
    });
  }

  private registerEvents() {
   this.cy.on('mouseover', 'node', (event) => {
    const node = event.target;

    // kreiraj div za tooltip
    const div = document.createElement('div');
    div.classList.add('cy-tooltip');
    div.innerHTML = `
      <strong>${node.data('label')}</strong><br/>
      Deadline %: ${node.data('deadlinePercentage') ?? 'n/a'}
      <br/>Reject count: ${node.data('returnCount') ?? 'n/a'}
      <br/>
      <u>Duration by Status:</u><br/>
      ${(node.data('durationByStatus') as IStatusDuration[] ?? [])
        .map((sd: IStatusDuration) => `
          <div>${sd.name}: ${sd.durationDays} days</div>
        `)
        .join('')}
    `;
    div.style.background = '#333';
    div.style.color = '#fff';
    div.style.padding = '6px 10px';
    div.style.borderRadius = '4px';
    div.style.fontSize = '13px';
    div.style.zIndex = '9999';
    document.body.appendChild(div);

    // referenca iz cytoscape nod-a
    const ref = (node as any).popperRef();

    // napravi popper instance
    const popperInstance = createPopper(ref, div, {
      placement: 'right',
    });

    // uništi kada miš izađe sa noda
    node.on('mouseout', () => {
      popperInstance.destroy();
      div.remove();
    });
  });

   this.cy.on('tap', 'node', (event) => {
  const node = event.target;
  const id = node.data('id');

  // Uništi sve tooltipe iz DOM-a
  document.querySelectorAll('.cy-tooltip').forEach(el => el.remove());

  if (id !== 'start' && id !== 'end') {
    this.router.navigate(['/document-preparation/analysis/document', id]);
  }
});
  }

  ngOnInit(): void {
  }
  public exportToPdf() {
    if (!this.cy) return;

    const pngData = this.cy.png({
      full: true,
      scale: 1,
      bg: '#ffffff'
    });

    const doc = new jsPDF({
      orientation:'portrait',
      unit: 'px',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.addImage(pngData, 'PNG', 0, 0, pageWidth/3, pageHeight/3);
    window.open(doc.output('bloburl'), '_blank');
  }
}
