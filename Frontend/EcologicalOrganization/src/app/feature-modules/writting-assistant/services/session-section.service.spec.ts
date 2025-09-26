import { TestBed } from '@angular/core/testing';

import { SessionSectionService } from './session-section.service';

describe('SessionSectionService', () => {
  let service: SessionSectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionSectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
