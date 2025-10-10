import { CommonModule, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { BoardComponent } from './components/board/board.component';
import { ListComponent } from './components/list/list.component';
import { OverviewComponent } from './components/overview/overview.component';
import { ProjectCreateWizardComponent } from './components/project-create-wizard/project-create-wizard.component';
import { ProjectsHomeComponent } from './components/projects-home/projects-home.component';
import { ShellComponent } from './components/shell/shell.component';
import { TaskDrawerComponent } from './components/task-drawer/task-drawer.component';

@NgModule({
  declarations: [
    ShellComponent,
    OverviewComponent,
    BoardComponent,
    ListComponent,
    AuditLogComponent,
    ProjectsHomeComponent,
    TaskDrawerComponent,
    AnalyticsComponent,
    ProjectCreateWizardComponent,
  ],
  imports: [CommonModule, RouterModule, FormsModule, DecimalPipe],
  exports: [
    // VAŽNO: pošto ih koristi AppRouting u definiciji children ruta,
    // export-ujemo da budu u kompilacionom dometu AppRoutingModule-a
    ShellComponent,
    OverviewComponent,
    BoardComponent,
    ListComponent,
    AuditLogComponent,
    ProjectsHomeComponent,
    ProjectCreateWizardComponent,
  ],
})
export class ProjectRealizationModule {}
