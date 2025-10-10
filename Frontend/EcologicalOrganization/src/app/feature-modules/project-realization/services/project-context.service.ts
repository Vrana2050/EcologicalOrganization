import { computed, Injectable, signal } from '@angular/core';
import { Project } from '../models/project.model';

@Injectable()
export class ProjectContextService {
  readonly project = signal<Project | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly id = computed(() => this.project()?.id ?? null);

  setLoading(v: boolean) {
    this.loading.set(v);
  }
  setError(v: string | null) {
    this.error.set(v);
  }
  setProject(p: Project | null) {
    this.project.set(p);
  }
}
