import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { DocumentManagementModule } from './feature-modules/document-management/document-management.module';
import { DocumentPreparationModule } from './feature-modules/document-preparation/document-preparation.module';
import { LayoutModule } from './feature-modules/layout/layout.module';
import { ProjectRealizationModule } from './feature-modules/project-realization/project-realization.module';
import { PromptAdminModule } from './feature-modules/prompt-admin/prompt-admin.module';
import { WrittingAssistantModule } from './feature-modules/writting-assistant/writting-assistant.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { JwtInterceptor } from './infrastructure/auth/jwt/jwt.interceptor';
import { MaterialModule } from './infrastructure/material/material.module';
import { AppRoutingModule } from './infrastructure/routing/app-routing.module';

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LayoutModule,
    BrowserAnimationsModule,
    MaterialModule,
    AuthModule,
    ProjectRealizationModule,
    DocumentManagementModule,
    DocumentPreparationModule,
    WrittingAssistantModule,
    PromptAdminModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
