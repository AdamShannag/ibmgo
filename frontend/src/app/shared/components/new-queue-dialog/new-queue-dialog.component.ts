import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { IbmmqDataService } from '../../services/ibmmq.data.service';
import { model } from '../../../../../wailsjs/go/models';
import { createDuplicateQueueValidator } from './duplicate-queue-validator';
import { InputGroupModule } from 'primeng/inputgroup';


@Component({
  selector: 'app-new-queue-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, InputGroupModule],
  templateUrl: './new-queue-dialog.component.html',
  styleUrl: './new-queue-dialog.component.scss'
})
export class NewQueueDialogComponent implements OnInit {
  currentQueues: model.Queue[] = [];
  formGroup!: FormGroup;

  constructor(private ref: DynamicDialogRef, private ibmDataService: IbmmqDataService, private refData: DynamicDialogConfig) { }

  ngOnInit(): void {
    this.currentQueues = this.refData.data as model.Queue[];

    this.formGroup = new FormGroup({
      queue: new FormControl<string>('', { validators: [Validators.required, createDuplicateQueueValidator(this.currentQueues)] }),
    });
  }

  addQueue() {
    if (!this.formGroup.valid) {
      return
    }
    this.ref.close(this.formGroup.value['queue'])
  }
}
