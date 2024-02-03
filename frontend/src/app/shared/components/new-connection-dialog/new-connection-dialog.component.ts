import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { QueueMangerConnectionData } from '../../services/ibmmq.data.service';
import { IbmGoApiService } from '../../services/ibm.go.api.service';

@Component({
  selector: 'app-new-connection-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, MessageModule, ToastModule],
  templateUrl: './new-connection-dialog.component.html',
  styleUrl: './new-connection-dialog.component.scss'
})
export class NewConnectionDialogComponent {
  formGroup: FormGroup = new FormGroup({
    queue: new FormControl<string>('QM1', { validators: [Validators.required], updateOn: 'submit' }),
    hostname: new FormControl<string>('localhost', { validators: [Validators.required], updateOn: 'submit' }),
    port: new FormControl<number>(1414, { validators: [Validators.required], updateOn: 'submit' }),
    channel: new FormControl<string>('DEV.ADMIN.SVRCONN', { validators: [Validators.required], updateOn: 'submit' }),
    username: new FormControl<string>('admin', { validators: [Validators.required], updateOn: 'submit' }),
    password: new FormControl<string>('passw0rd', { validators: [Validators.required], updateOn: 'submit' }),
  });

  constructor(private ref: DynamicDialogRef, private ibmGoApiService: IbmGoApiService) { }

  createNewConnection() {
    if (!this.formGroup.valid) {
      return
    }

    const data: QueueMangerConnectionData = {
      queueManager: this.formGroup.value['queue'],
      hostname: this.formGroup.value['hostname'],
      channel: { channelName: this.formGroup.value['channel'], queues: [] },
      port: this.formGroup.value['port'],
      username: this.formGroup.value['username'],
      password: this.formGroup.value['password'],
    }

    this.ibmGoApiService.connectToIbmmq(data.port!, data.queueManager, data.hostname!, data.channel.channelName, data.username!, data.password!)
      .then(connected => {
        if (!connected) return
        this.ref.close(data)
      })
  }
}
