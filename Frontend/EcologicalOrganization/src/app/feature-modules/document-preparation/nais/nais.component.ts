import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { ChartConfiguration } from 'chart.js';
import { ChartOptions, ChartType } from 'chart.js';
import { FormGroup, FormControl } from '@angular/forms';


@Component({
  selector: 'xp-nais',
  templateUrl: './nais.component.html',
  styleUrls: ['./nais.component.css']
})
export class NaisComponent implements OnInit {
   public startDate: Date | null = null;
  public endDate: Date | null = null;
public barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Prosečno vreme dokumenta po statusu (u danima)' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue} dana`
        }
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };
  public maxStatusInfo: { statusId: number; timeSpent: number } | null = null;

public barChartLabels: string[] = [];
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Avg Time (s)',
        backgroundColor: [],
      }
    ]
  };
  public barChartType: ChartType = 'bar';
  projectId: string | null = null;
    public dateRangeForm = new FormGroup({
      startDate: new FormControl<Date | null>(null),
  endDate: new FormControl<Date | null>(null)
  });
  constructor( private http: HttpClient ,private route : ActivatedRoute) { }
 ngOnInit(): void {
      const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    this.dateRangeForm.patchValue({
       startDate: sevenDaysAgo,
      endDate: now
    });
  this.route.paramMap.subscribe(params => {
    const id = params.get('id');
    this.projectId = id;

    // ⛔ Ako id nije prisutan, ne šalji zahtev dok se ne pojavi
    if (!id) {
      console.warn('⏳ Projekat ID nije još dostupan.');
      return;
    }

    this.fetchData(id);
  });
}

fetchData(id: string | null,body?:any) {
  const params = new HttpParams().set('projekatId', id ?? '');
  if(body === undefined){
    body={};
  }
  this.http.post(`http://localhost:8005/api/docPrep/influx/report`, body, { params })
    .subscribe((response: any) => {
      console.log('Podaci iz API-ja:', response);
      const statuses = response.statuses;
      const maxStatus = response.maxStatusTime.statusId;
      this.maxStatusInfo = response.maxStatusTime;

      this.barChartData = { ...this.barChartData, labels: [], datasets: [{ data: [], label: 'Avg Time (s)', backgroundColor: [] }] };

      this.barChartData.labels = statuses.map((s: any) => s.statusId.toString());
      this.barChartData.datasets[0].data = statuses.map((s: any) => s.avgTime/86400);
      this.barChartData.datasets[0].backgroundColor = statuses.map((s: any) =>
        s.statusId === maxStatus ? '#FF5252' : '#42A5F5'
      );
    });
}
  onSubmit(): void {
    if (this.dateRangeForm.valid) {
      const { startDate, endDate } = this.dateRangeForm.value;

      // Pretvori u ISO format koji backend očekuje
     const startDateObj = new Date(startDate!);
    startDateObj.setUTCMilliseconds(1); // ✅ mala korekcija da ne bude 00.000Z
    const start = startDateObj.toISOString();
    const endDateObj = new Date(endDate!);
    endDateObj.setUTCMilliseconds(1);
    const end = endDateObj.toISOString();
      const body = {
        start: start,
        end: end
      };

      console.log('📤 Slanje ka backendu:', body);
      // ovde možeš pozvati svoj this.http.post(...) itd.
      this.fetchData(this.projectId,body);
    }
  }


}
