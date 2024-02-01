import {Component} from '@angular/core';
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {LoadingService} from "./loading.service";
import {AsyncPipe} from "@angular/common";

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [
    ProgressSpinnerModule,
    AsyncPipe
  ],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  constructor(public loadingService: LoadingService) {
  }
}
