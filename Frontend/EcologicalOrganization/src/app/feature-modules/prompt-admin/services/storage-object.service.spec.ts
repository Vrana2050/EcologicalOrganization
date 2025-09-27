import { TestBed } from '@angular/core/testing';

import { StorageObjectService } from './storage-object.service';

describe('StorageObjectService', () => {
  let service: StorageObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageObjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
