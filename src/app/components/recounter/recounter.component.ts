import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {DataSource} from '@angular/cdk';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import {Damage, DisplayData} from '../../interface/damge';
import {MdSort} from '@angular/material';

@Component({
  selector: 'app-recounter',
  templateUrl: './recounter.component.html',
  styleUrls: ['./recounter.component.scss']
})
export class RecounterComponent implements OnInit {

  displayedColumns = ['sourceName', 'dps', 'damage'];
  damageDatabase = new DamgerDatabase();
  dataSource: DamageDataSource;
  @ViewChild(MdSort) sort: MdSort;

  constructor(private changeDetector: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.dataSource = new DamageDataSource(this.damageDatabase, this.sort);
    this.changeDetector.detectChanges();
  }

  updateDamage() {
    this.damageDatabase.addUser();
  }

  cleanUp() {
    this.damageDatabase.clean();
  }
}

const NAMES = ['Maia'];

export class DamgerDatabase {
  /** Stream that emits whenever the data has been modified. */
  dataChange: BehaviorSubject<Map<string, DisplayData>> = new BehaviorSubject<Map<string, DisplayData>>(new Map<string, DisplayData>());

  get data(): Map<string, DisplayData> {
    return this.dataChange.value;
  }

  instanceID: number;

  static movingAvge(avg: number, newNum: number, size: number): number {
    return ((avg * size) + newNum) / (size + 1);
  }

  constructor() {
    this.instanceID = 0;
  }

  /** Adds a new user to the database. */
  addUser() {
    const copiedData: Map<string, DisplayData> = this.data;
    const detail = this.createNewDamage();
    const displayData: DisplayData = {
      sourceName: detail.sourceName,
      dps: detail.damage,
      damage: detail.damage,
      lastTimestamp: detail.timestamp,
      detail: [detail],
    };
    if (!copiedData.has(detail.sourceName)) {
      copiedData.set(detail.sourceName, displayData);
    } else {
      copiedData.get(detail.sourceName).damage += detail.damage;
      const avg = copiedData.get(detail.sourceName).dps;
      copiedData.get(detail.sourceName).dps = DamgerDatabase.movingAvge(avg, detail.damage, displayData.detail.length);
      copiedData.get(detail.sourceName).lastTimestamp = detail.timestamp;
    }
    this.dataChange.next(copiedData);
  }

  clean() {
    this.dataChange.next(new Map<string, DisplayData>());
  }


  private createNewDamage(): Damage {
    const name = NAMES[Math.round(Math.random() * (NAMES.length - 1))];
    return {
      timestamp: new Date().getTime(),
      instanceID: this.instanceID++,
      sourceID: 0,
      sourceName: name,
      targetID: 0,
      targetName: name,
      attackID: 0,
      damage: Math.round(Math.random() * (20000 - 1)),
      IsJA: Math.random() >= 0.5,
      IsCrit: Math.random() >= 0.5,
      IsMultiHit: Math.random() >= 0.5,
      IsMisc: Math.random() >= 0.5,
      IsMisc2: Math.random() >= 0.5
    };
  }
}


export class DamageDataSource extends DataSource<any> {
  constructor(private damgerDatabase: DamgerDatabase, private sort: MdSort) {
    super();
  }

  connect(): Observable<DisplayData[]> {
    console.log('connect');
    const displayDataChanges = [
      this.damgerDatabase.dataChange,
      this.sort.mdSortChange,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      return this.getSortedData();
    });
  }

  disconnect() {
    console.log('disconnect');
  }

  getSortedData(): DisplayData[] {
    if (this.damgerDatabase.data === null) {
      return []
    }
    const data = Array.from(this.damgerDatabase.data.values());
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this.sort.active) {
        case 'userName':
          [propertyA, propertyB] = [a.sourceName, b.sourceName];
          break;
        case 'dps':
          [propertyA, propertyB] = [a.dps, b.dps];
          break;
        case 'damage':
          [propertyA, propertyB] = [a.damage, b.damage];
          break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
    });
  }
}
