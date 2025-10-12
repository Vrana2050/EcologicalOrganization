import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './infrastructure/routing/app-routing.module';
import { AppComponent } from './app.component';
import { LayoutModule } from './feature-modules/layout/layout.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './infrastructure/material/material.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtInterceptor } from './infrastructure/auth/jwt/jwt.interceptor';
import { DocumentManagementModule } from './feature-modules/document-management/document-management.module';
import { DocumentPreparationModule } from './feature-modules/document-preparation/document-preparation.module';
import { WrittingAssistantModule } from './feature-modules/writting-assistant/writting-assistant.module';
import { ProjectRealizationModule } from './feature-modules/project-realization/project-realization.module';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LayoutModule,
    BrowserAnimationsModule,
    MaterialModule,
    MatIconModule,
    AuthModule,
    HttpClientModule,
    DocumentManagementModule,
    DocumentPreparationModule,
    WrittingAssistantModule,
    ProjectRealizationModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
