import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  public name: string | null = null;
  public number: string | null = null;
  public deviceId: string | null = null;

  constructor() { }

  async ngOnInit() {
    this.name = await (await Preferences.get({ key: 'notifyName' })).value;
    this.number = await (await Preferences.get({ key: 'notifyNumber' })).value;
    this.deviceId = await (await Preferences.get({ key: 'deviceId' })).value;
  }

  nameChanged(val: string | null) {
//    this.name = val;
    if(val) {
      Preferences.set({
        key: 'notifyName',
        value: val,
      });
    } else {
      Preferences.remove({ key: 'notifyName' });
    }
  }
  numberChanged(val: string | null) {
    // this.number = val;
    if(val) {
      Preferences.set({
        key: 'notifyNumber',
        value: val,
      });
    } else {
      Preferences.remove({ key: 'notifyNumber' });
    }
  }

}
