import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewQueueDialogComponent } from './new-queue-dialog.component';

describe('NewQueueDialogComponent', () => {
  let component: NewQueueDialogComponent;
  let fixture: ComponentFixture<NewQueueDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewQueueDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewQueueDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
