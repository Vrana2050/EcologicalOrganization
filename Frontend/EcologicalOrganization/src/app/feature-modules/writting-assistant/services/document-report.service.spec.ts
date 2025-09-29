import { TestBed } from '@angular/core/testing';

import { DocumentReportService } from './document-report.service';

describe('DocumentReportService', () => {
  let service: DocumentReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
