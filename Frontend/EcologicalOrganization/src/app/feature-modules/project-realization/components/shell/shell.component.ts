import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { ProjectContextService } from '../../services/project-context.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'xp-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css'],
  providers: [ProjectContextService],
})
export class ShellComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ProjectService,
    public ctx: ProjectContextService
  ) {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const id = Number(params.get('id'));
          if (!id) {
            this.router.navigate(['/project-realization']);
            throw new Error('Bad id');
          }
          this.ctx.setLoading(true);
          this.ctx.setError(null);
          this.ctx.setProject(null);
          return this.api.getById(id);
        })
      )
      .subscribe({
        next: (project) => {
          this.ctx.setProject(project);
          this.ctx.setLoading(false);
        },
        error: (_) => {
          this.ctx.setError('Project not found.');
          this.ctx.setLoading(false);
          this.router.navigate(['/project-realization']);
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  goNewProject() {
    this.router.navigate(['/project-realization/new']);
  }
}
