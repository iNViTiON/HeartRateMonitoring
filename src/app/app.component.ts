/// <reference types="w3c-web-usb" />

import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import type { Observable } from 'rxjs';
import { filter, map, pairwise, ReplaySubject, share } from 'rxjs';
import { BluetoothHRService, HeartRateData } from './bluetooth-hr.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public isStandalone = !window.menubar.visible;

  public device$: Observable<BluetoothDevice>;
  public heartRate$: Observable<HeartRateData>;
  public heartRateLocation$: Observable<string>;
  public hrv$: Observable<string>;

  public connectHr = () => this.bhr.connectHr();

  constructor(private titleService: Title, private bhr: BluetoothHRService) {
    this.titleService.setTitle(
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

  public standalone() {
    window.open(
      window.location.href,
      'null',
      'location=no,toolbar=no,menubar=no,scrollbars=no,resizable=yes; width=600; height=240'
    );
  }

  public singleClick() {
    this.usb();
    // (this.isStandalone ? this.connectHr : this.standalone)();
  }

  // windows need zadig https://zadig.akeo.ie/
  private async usb() {
    const device = await navigator.usb.requestDevice({
      filters: [
        { vendorId: 0xfcf, productId: 0x1008 },
        { vendorId: 0xfcf, productId: 0x1009 },
      ],
    });
    (window as any)['d'] = device;
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(0);
  }
}
