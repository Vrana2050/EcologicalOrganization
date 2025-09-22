import { TestBed } from '@angular/core/testing';

import { OutputFeedbackService } from './output-feedback.service';

describe('OutputFeedbackService', () => {
  let service: OutputFeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutputFeedbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
