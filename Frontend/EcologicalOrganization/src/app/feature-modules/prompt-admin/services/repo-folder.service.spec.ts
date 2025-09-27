import { TestBed } from '@angular/core/testing';

import { RepoFolderService } from './repo-folder.service';

describe('RepoFolderService', () => {
  let service: RepoFolderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepoFolderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
