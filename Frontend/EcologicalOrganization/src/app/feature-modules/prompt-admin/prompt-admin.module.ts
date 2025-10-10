import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeedbackSummaryComponent } from './components/feedback-summary/feedback-summary.component';
import { PromptAnalyticsComponent } from './components/prompt-analytics/prompt-analytics.component';
import { PromptEditorComponent } from './components/prompt-editor/prompt-editor.component';
import { PromptEvaluationComponent } from './components/prompt-evaluation/prompt-evaluation.component';
import { PromptFeedbackComponent } from './components/prompt-feedback/prompt-feedback.component';
import { PromptHeaderComponent } from './components/prompt-header/prompt-header.component';
import { PromptVersionComponent } from './components/prompt-version/prompt-version.component';
import { PromptsSidebarComponent } from './components/prompts-sidebar/prompts-sidebar.component';
import { SystemAnalyticsComponent } from './components/system-analytics/system-analytics.component';
import { VersionsSidebarComponent } from './components/versions-sidebar/versions-sidebar.component';
import { PromptAdminPageComponent } from './page/admin-page/admin-page.component';
import { DocumentTypeManagementComponent } from './page/document-type-management/document-type-management.component';
@NgModule({
  declarations: [
    PromptAdminPageComponent,
    PromptsSidebarComponent,
    VersionsSidebarComponent,
    PromptHeaderComponent,
    PromptEditorComponent,
    PromptVersionComponent,
    DocumentTypeManagementComponent,
    PromptAnalyticsComponent,
    PromptFeedbackComponent,
    PromptEvaluationComponent,
    FeedbackSummaryComponent,
    SystemAnalyticsComponent,
  ],
  imports: [CommonModule, FormsModule],
})
export class PromptAdminModule {}
