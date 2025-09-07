import { TestBed } from '@angular/core/testing';

import { PromptVersionService } from './prompt-version.service';

describe('PromptVersionService', () => {
  let service: PromptVersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromptVersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
