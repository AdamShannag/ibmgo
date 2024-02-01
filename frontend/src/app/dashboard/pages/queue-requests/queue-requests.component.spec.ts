import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueueRequestsComponent } from './queue-requests.component';

describe('QueueRequestsComponent', () => {
  let component: QueueRequestsComponent;
  let fixture: ComponentFixture<QueueRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueueRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QueueRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
