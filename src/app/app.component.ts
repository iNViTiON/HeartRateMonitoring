import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RX_RENDER_STRATEGIES_CONFIG } from '@rx-angular/cdk/render-strategies';
import { LetModule } from '@rx-angular/template/let';
import { PushModule } from '@rx-angular/template/push';
import type { Observable } from 'rxjs';
import { filter, map, pairwise, ReplaySubject, share } from 'rxjs';
import { BluetoothHRService, HeartRateData } from './bluetooth-hr.service';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: RX_RENDER_STRATEGIES_CONFIG,
      useValue: {
        primaryStrategy: 'noop',
        patchZone: false,
      },
    },
  ],
  imports: [CommonModule, LetModule, PushModule],
})
export class AppComponent {
  public readonly isStandalone = !window.menubar.visible;

  public readonly device$: Observable<BluetoothDevice>;
  public readonly heartRate$: Observable<HeartRateData>;
  public readonly heartRateLocation$: Observable<string>;
  public readonly hrv$: Observable<string>;
  private readonly bhr = inject(BluetoothHRService);
  private readonly connectHr = () => this.bhr.connectHr();

  constructor() {
    inject(Title).setTitle(
      this.isStandalone ? 'Heart Rate Monitor' : 'Heart Rate Monitor Launcher'
    );

    this.device$ = this.bhr.device$;
    this.heartRate$ = this.bhr.heartRate$;
    this.heartRateLocation$ = this.bhr.location$;
    this.hrv$ = this.bhr.heartRate$.pipe(
      map(({ rrIntervals }) => rrIntervals),
      filter((rrs): rrs is number[] => rrs !== undefined),
      map((rrs) => rrs[rrs?.length - 1]),
      pairwise(),
      map(([prev, curr]) => curr - prev),
      map((v) => `${v < 0 ? '' : '+'}${v}ms`),
      share({
        connector: () => new ReplaySubject(1),
        resetOnRefCountZero: true,
      })
    );
  }

  private standalone() {
    window.open(
      window.location.href,
      'null',
      'location=no,toolbar=no,menubar=no,scrollbars=no,resizable=yes; width=600; height=240'
    );
  }

  public singleClick() {
    (this.isStandalone ? this.connectHr : this.standalone)();
  }
}
