import { TestBed } from '@angular/core/testing';

import { BluetoothHRService } from './bluetooth-hr.service';

describe('BluetoothHRService', () => {
  let service: BluetoothHRService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BluetoothHRService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
