import { TestBed } from '@angular/core/testing';

import { ElectionService } from './election.service';

describe('ElectionService', () => {
  let service: ElectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
