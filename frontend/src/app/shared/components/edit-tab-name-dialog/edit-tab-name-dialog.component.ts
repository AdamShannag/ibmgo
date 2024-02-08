import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-edit-tab-name-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './edit-tab-name-dialog.component.html',
  styleUrl: './edit-tab-name-dialog.component.scss'
})
export class EditTabNameDialogComponent {
  formGroup: FormGroup = new FormGroup({
    tab: new FormControl<string>(this.conf.data['tabName']
      , { validators: [Validators.required], updateOn: 'submit' }),
  });

  constructor(private ref: DynamicDialogRef, private conf: DynamicDialogConfig) { }

  submit() {
    if (!this.formGroup.valid) {
      return
    }
    this.ref.close(this.formGroup.value['tab'])
  }
}
