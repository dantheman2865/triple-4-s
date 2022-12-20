import { Component, OnInit } from '@angular/core';
import { BLE } from '@awesome-cordova-plugins/ble/ngx';
import { Preferences } from '@capacitor/preferences';
import { ToastController } from '@ionic/angular';
import { SMS } from '@awesome-cordova-plugins/sms/ngx';
import { throttle, interval, Subject } from 'rxjs';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private peripheral: any;
  private notifier: Subject<boolean> = new Subject();

  constructor(
    private ble: BLE,
    private toastCtrl: ToastController,
    private sms: SMS,
    private androidPermissions: AndroidPermissions,
  ) { 
    const slowNotify = this.notifier.pipe(
      throttle(() => interval(30000))
    );
    slowNotify.subscribe(x => {
      this.triggered(true);
    });
  }

  async ngOnInit() {
    this.androidPermissions.requestPermissions(
      [
        this.androidPermissions.PERMISSION.BLUETOOTH, 
        this.androidPermissions.PERMISSION.BLUETOOTH_ADMIN, 
        this.androidPermissions.PERMISSION.BLUETOOTH_SCAN,
        this.androidPermissions.PERMISSION.BLUETOOTH_CONNECT,
        this.androidPermissions.PERMISSION.SEND_SMS,
        this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
        this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
      ]
    ).then(async () => {
      let deviceId = await (await Preferences.get({ key: 'deviceId' })).value;
      if(deviceId) {
        this.BleConnect(deviceId);
      }
    });
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION).then(
      result => console.log('Has permission?',result.hasPermission),
      err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION)
    );
    // this.androidPermissions.requestPermissions(
    //   [
    //     this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
    //     this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
    //   ]
    // ).then(async () => {
    //   const coordinates = await Geolocation.getCurrentPosition();
    //   console.log('Current position:', coordinates);
    // });
  }

  BleConnect(deviceId: any) {
    this.ble.connect(deviceId).subscribe({
      next: x => this.onConnected(x),
      error: err => this.onDeviceDisconnected(err)
    });
  }

  BleDisconnect() {
    this.ble.disconnect(this.peripheral.id).then(
      () => console.log('Disconnected ' + JSON.stringify(this.peripheral)),
      () => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))
    );
  }


  onConnected(peripheral: any) {
    console.log(JSON.stringify(peripheral))
    this.peripheral = peripheral;
    this.ble.startNotification(peripheral.id, "ce4638f8-c4de-f1b0-1542-f3a5a09c68cd", "0001")
      .subscribe({
        next: (x: any) => this.onDeviceNotify(x),
        error: (err: any) => console.log("Error: " + JSON.stringify(err))
      });
  }

  async onDeviceDisconnected(peripheral: any) {
    const toast = await this.toastCtrl.create({
      message: 'The device could not connect',
      duration: 3000,
      position: 'middle'
    });
    toast.present();
  }

  async onDeviceNotify(data: any) {
    this.ble.read(this.peripheral.id, "ce4638f8-c4de-f1b0-1542-f3a5a09c68cd", "0002").then(x => {
      console.log("Read Success: " + JSON.stringify(x));
      var buffer = new Uint8Array(x);
      console.log("Data: " + JSON.stringify(buffer));
      if(buffer["0"] == 1) {
        this.notifier.next(true);
      }
      // this.triggered(buffer["0"] == 1);
    })
    .catch(err => {
      console.log("Read Error: " + JSON.stringify(err));
    })
  }

  async triggered(t: boolean) {
    const toast = await this.toastCtrl.create({
      message: t ? 'Triggered' : 'Not Triggered',
      duration: 3000,
      position: 'middle'
    });
    toast.present();
    console.log("Triggered " + t);
    let name = (await Preferences.get({key: 'notifyName'})).value;
    let number = (await Preferences.get({key: 'notifyNumber'})).value;
    if(number) {
      // Get GPS location
      const coordinates = await Geolocation.getCurrentPosition();
      let coordStr = "http://maps.google.com/maps?q=" + coordinates.coords.longitude +"," + coordinates.coords.latitude;
      let str = "Attention! " + name + " has triggered their Triple4s pepper spray at " + coordStr;
      this.sms.send(number, str);
    }
  }

  // Disconnect peripheral when leaving the page
  ionViewWillLeave() {
  console.log('ionViewWillLeave disconnecting Bluetooth');
    this.BleDisconnect();
  }
}
