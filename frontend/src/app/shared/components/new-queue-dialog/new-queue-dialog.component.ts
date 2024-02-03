import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { IbmmqDataService } from '../../services/ibmmq.data.service';

@Component({
  selector: 'app-new-queue-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './new-queue-dialog.component.html',
  styleUrl: './new-queue-dialog.component.scss'
})
export class NewQueueDialogComponent {
  formGroup: FormGroup = new FormGroup({
    queue: new FormControl<string>('', { validators: [Validators.required], updateOn: 'submit' }),
  });

  constructor(private ref: DynamicDialogRef, private ibmDataService: IbmmqDataService) { }

  addQueue() {
    if (!this.formGroup.valid) {
      return
    }
    this.ref.close(this.formGroup.value['queue'])
  }
}
