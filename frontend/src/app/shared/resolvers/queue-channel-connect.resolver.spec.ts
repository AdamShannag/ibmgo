import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { queueChannelConnectResolver } from './queue-channel-connect.resolver';

describe('queueChannelConnectResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => queueChannelConnectResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
