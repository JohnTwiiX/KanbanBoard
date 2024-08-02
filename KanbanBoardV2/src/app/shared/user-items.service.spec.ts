import { TestBed } from '@angular/core/testing';

import { UserItemsService } from './user-items.service';

describe('UserItemsService', () => {
  let service: UserItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
