import {Component, OnInit, ViewChild} from '@angular/core';
import {DataSource} from '@angular/cdk';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import {DisplayData} from '../../interface/damge';
import {MdSort} from '@angular/material';

@Component({
  selector: 'app-recounter',
  templateUrl: './recounter.component.html',
  styleUrls: ['./recounter.component.scss']
})
export class RecounterComponent implements OnInit {

  displayedColumns = ['userName', 'DPS', 'Damage'];
  damageDatabase = new DamgerDatabase();
  dataSource: DamageDataSource;
  @ViewChild(MdSort) sort: MdSort;

  ngOnInit() {
    this.dataSource = new DamageDataSource(this.damageDatabase, this.sort);
  }

}

export class DamgerDatabase {
  /** Stream that emits whenever the data has been modified. */
  dataChange: BehaviorSubject<DisplayData[]> = new BehaviorSubject<DisplayData[]>([]);

  get data(): DisplayData[] {
    return this.dataChange.value;
  }

  constructor() {
    for (let i = 0; i < 100; i++) {
      this.addUser();
    }
  }

  /** Adds a new user to the database. */
  addUser() {
    const copiedData = this.data.slice();
    copiedData.push(this.createNewUser());
    this.dataChange.next(copiedData);
  }

  private createNewUser() {

    return {
      sourceName: 'Kana',
      DPS: 1,
      Damage: 1,
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
  }

  getSortedData(): DisplayData[] {
    const data = this.damgerDatabase.data.slice();
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
        case 'DPS':
          [propertyA, propertyB] = [a.DPS, b.DPS];
          break;
        case 'Damage':
          [propertyA, propertyB] = [a.Damage, b.Damage];
          break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
    });
  }
}
