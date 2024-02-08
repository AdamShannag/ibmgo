import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTabNameDialogComponent } from './edit-tab-name-dialog.component';

describe('EditTabNameDialogComponent', () => {
  let component: EditTabNameDialogComponent;
  let fixture: ComponentFixture<EditTabNameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTabNameDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditTabNameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
