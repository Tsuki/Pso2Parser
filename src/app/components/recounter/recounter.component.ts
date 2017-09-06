import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {DataSource} from '@angular/cdk';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import {Damage, DisplayData} from '../../interface/damge';
import {MdSort} from '@angular/material';
import * as fs from 'fs';
import {join} from 'path';
import * as tail from 'file-tail';

const {dialog} = require('electron').remote;

@Component({
  selector: 'app-recounter',
  templateUrl: './recounter.component.html',
  styleUrls: ['./recounter.component.scss']
})
export class RecounterComponent implements OnInit {
  displayedColumns = ['sourceName', 'dps', 'damage'];
  damageDatabase = new DamageDatabase();
  dataSource: DamageDataSource;
  @ViewChild(MdSort) sort: MdSort;
  pso2File = '';
  pso2Path = '';

  constructor(private changeDetector: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.dataSource = new DamageDataSource(this.damageDatabase, this.sort);
    this.changeDetector.detectChanges();
  }

  cleanUp() {
    this.damageDatabase.clean();
  }

  onFileInput() {
    this.pso2Path = dialog.showOpenDialog({properties: ['openDirectory']})[0];
    const files = fs.readdirSync(this.pso2Path);
    this.pso2File = join(this.pso2Path, files.reduce((last, current) => {
      const currentFileDate = new Date(fs.statSync(join(this.pso2Path, current)).mtime);
      const lastFileDate = new Date(fs.statSync(join(this.pso2Path, last)).mtime);
      return ( currentFileDate.getTime() > lastFileDate.getTime() ) ? current : last;
    }));
    const ft = tail.startTailing(this.pso2File);
    console.log(this.pso2File);
    ft.on('line', line => {
      console.log(line);
      this.damageDatabase.addUser(line);
    });
  }
}

const NAMES = ['Maia'];

export class DamageDatabase {
  /** Stream that emits whenever the data has been modified. */
  dataChange: BehaviorSubject<Map<string, DisplayData>> = new BehaviorSubject<Map<string, DisplayData>>(new Map<string, DisplayData>());

  get data(): Map<string, DisplayData> {
    return this.dataChange.value;
  }

  instanceID: number;

  private static parseDamage(input: string): Damage {
    const data = input.split(',');
    if (data[0] === '0' || data[3].match('sourceName')) {
      return null;
    }
    const result = {
      timestamp: Number(data[0]),
      instanceID: Number(data[1]),
      sourceID: Number(data[2]),
      sourceName: data[3],
      targetID: Number(data[4]),
      targetName: data[5],
      attackID: Number(data[6]),
      damage: Number(data[7]),
      IsJA: data[8] === '1',
      IsCrit: data[9] === '1',
      IsMultiHit: data[10] === '1',
      IsMisc: data[11] === '1',
      IsMisc2: data[12] === '1',
    };
    if (result.instanceID === result.targetID) {
      return null
    }
    if (result.sourceName === 'Unknown') {
      return null
    }
    if (result.damage <= 0) {
      return null
    }
    if (result.IsMisc || result.IsMisc2) {
      return null
    }
    if (result.sourceID < 10000000) {
      return null
    }
    return result
  }

  constructor() {
    this.instanceID = 0;
  }


  addUser(input?: string) {
    const copiedData: Map<string, DisplayData> = this.data;
    let detail: Damage;
    if (input != null) {
      detail = DamageDatabase.parseDamage(input);
    } else {
      detail = this.createNewDamage();
    }
    if (detail == null) {
      return
    } else {
    }
    const displayData: DisplayData = {
      sourceName: detail.sourceName,
      dps: detail.damage,
      damage: detail.damage,
      startTimestamp: detail.timestamp,
      detail: [detail],
    };
    if (!copiedData.has(detail.sourceName)) {
      copiedData.set(detail.sourceName, displayData);
    } else {
      const _data = copiedData.get(detail.sourceName);
      _data.damage += detail.damage;
      _data.dps = _data.damage / (detail.timestamp - _data.startTimestamp)
    }
    this.dataChange.next(copiedData);
  }

  clean() {
    this.dataChange.next(new Map<string, DisplayData>());
  }


  private createNewDamage(): Damage {
    const name = NAMES[Math.round(Math.random() * (NAMES.length - 1))];
    return {
      timestamp: new Date().getTime() / 1000,
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
  constructor(private damgerDatabase: DamageDatabase, private sort: MdSort) {
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
