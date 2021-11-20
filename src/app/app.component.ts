import { Component } from '@angular/core';
import { filter, map, Observable, pairwise } from 'rxjs';
import { share, take, tap, timer } from 'rxjs';
import { BluetoothHRService, HeartRateData } from './bluetooth-hr.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public device$: Observable<string>;
  public heartRate$: Observable<HeartRateData>;
  public heartRateLocation$: Observable<string>;
  public hrv$: Observable<string>;

  public connectHr = () => this.bhr.connectHr();

  constructor(private bhr: BluetoothHRService) {
    this.device$ = this.bhr.device$;
    this.heartRate$ = this.bhr.heartRate$;
    this.heartRateLocation$ = this.bhr.location$;
    this.hrv$ = this.bhr.heartRate$.pipe(
      map(({ rrIntervals }) => rrIntervals),
      filter((rrs): rrs is number[] => rrs !== undefined),
      map((rrs) => rrs[rrs?.length - 1]),
      pairwise(),
      map(([prev, curr]) => curr - prev),
      map((v) => `${v < 0 ? '' : '+'}${v}ms`)
    );
  }
}
