import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { IbmGoApiService } from '../../services/ibm.go.api.service';
import { model } from '../../../../../wailsjs/go/models';

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

    const connectionDetails = new model.ConnectionData()

    connectionDetails.hostname = this.formGroup.value['hostname']
    connectionDetails.password = this.formGroup.value['password']
    connectionDetails.port = this.formGroup.value['port']
    connectionDetails.username = this.formGroup.value['username']

    const queueMap: { [key: string]: model.Queue } = {}

    const channel = new model.Channel()
    channel.name = this.formGroup.value['channel']
    channel.queues = queueMap


    const chanMap: { [key: string]: model.Channel } = {}
    chanMap[channel.name] = channel

    const data = new model.QueueManager()
    data.name = this.formGroup.value['queue'];
    data.connection_settings = connectionDetails;
    data.channels = chanMap

    this.ibmGoApiService.connectToIbmmq(this.formGroup.value['port'], this.formGroup.value['queue'], this.formGroup.value['hostname'], this.formGroup.value['channel'], this.formGroup.value['username'], this.formGroup.value['password'])
      .then(connected => {
        if (!connected) return
        this.ref.close(data)
      })
  }
}
