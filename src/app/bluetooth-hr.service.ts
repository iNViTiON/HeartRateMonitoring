/// <reference types="web-bluetooth" />

import { Injectable } from '@angular/core';
import {
  delayWhen,
  filter,
  from,
  fromEvent,
  map,
  ReplaySubject,
  share,
  Subject,
  switchMap,
} from 'rxjs';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BluetoothHRService {
  private sensorLocationDict: Record<number, string> = {
    0: 'Other',
    1: 'Chest',
    2: 'Wrist',
    3: 'Finger',
    4: 'Hand',
    5: 'Ear Lobe',
    6: 'Foot',
  };

  private newDevice$ = new Subject<void>();
  public device$: Observable<BluetoothDevice>;
  private server$: Observable<BluetoothRemoteGATTServer>;
  private service$: Observable<BluetoothRemoteGATTService>;
  public location$: Observable<string>;
  public heartRate$: Observable<HeartRateData>;
  constructor() {
    this.device$ = this.newDevice$.pipe(
      switchMap(() =>
        navigator.bluetooth.requestDevice({
          filters: [
            {
              services: ['heart_rate'],
            },
          ],
        })
      ),
      share({
        connector: () => new ReplaySubject(1),
        resetOnRefCountZero: true,
      })
    );
    this.server$ = this.device$.pipe(
      map((device) => device.gatt),
      filter((gatt): gatt is BluetoothRemoteGATTServer => gatt !== undefined),
      switchMap((gatt) => gatt.connect()),
      share({
        connector: () => new ReplaySubject(1),
        resetOnRefCountZero: true,
      })
    );
    this.service$ = this.server$.pipe(
      switchMap((server) => server.getPrimaryService('heart_rate')),
      share({
        connector: () => new ReplaySubject(1),
        resetOnRefCountZero: true,
      })
    );
    this.location$ = this.service$.pipe(
      switchMap((service) => service.getCharacteristic('body_sensor_location')),
      switchMap((characteristic: any) => characteristic.readValue()),
      map(
        (value: any) => this.sensorLocationDict[value.getUint8(0)] ?? 'Unknown'
      ),
      share({
        connector: () => new ReplaySubject(1),
        resetOnRefCountZero: true,
      })
    );
    this.heartRate$ = this.service$.pipe(
      switchMap((service) =>
        service.getCharacteristic('heart_rate_measurement')
      ),
      delayWhen((characteristic: any) =>
        from(characteristic.startNotifications())
      ),
      switchMap((characteristic) =>
        fromEvent(characteristic, 'characteristicvaluechanged')
      ),
      map((event: any) => event.target?.value),
      map(this.parseHeartRate),
      share({
        connector: () => new ReplaySubject(1),
        resetOnRefCountZero: true,
      })
    );
  }

  private parseHeartRate(value: DataView) {
    const flags = value.getUint8(0);
    const hr16 = flags & 0x1;
    const result: HeartRateData = {
      heartRate: hr16 ? value.getUint16(1, true) : value.getUint8(1),
    };
    const afterHrIndex = 2 + hr16;
    if (flags & 0x4) {
      result.contactDetected = !!(flags & 0x2);
    }
    if (flags & 0x8) {
      result.energyExpended = value.getUint16(afterHrIndex, true);
    }
    if (flags & 0x10) {
      result.rrIntervals = [
        ...new Uint16Array(
          value.buffer.slice(afterHrIndex + (result.energyExpended ? 2 : 0))
        ),
      ];
    }
    return result;
  }

  public connectHr = () => this.newDevice$.next();
}

export interface HeartRateData {
  heartRate: number;
  contactDetected?: boolean;
  energyExpended?: number;
  rrIntervals?: number[];
}
