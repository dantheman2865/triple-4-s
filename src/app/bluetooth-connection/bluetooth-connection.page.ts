import { Component, NgZone, OnInit } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BLE } from '@awesome-cordova-plugins/ble/ngx';
import { Preferences } from '@capacitor/preferences';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-bluetooth-connection',
  templateUrl: './bluetooth-connection.page.html',
  styleUrls: ['./bluetooth-connection.page.scss'],
})
export class BluetoothConnectionPage implements OnInit {
  public statusMessage: string;
  public devices: any[];
  peripheral: any = {};


  constructor(
    private toastCtrl: ToastController,
    private ble: BLE,
    private androidPermissions: AndroidPermissions,
    private ngZone: NgZone
  ) { 
    this.statusMessage = "Initializing"
    this.devices = [];
  }

  ngOnInit() {
  }

  scan() {
    console.log("Scanning");
    this.setStatus("Scanning for Bluetooth LE Devices");
    this.devices = []; // clear list

    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.BLUETOOTH).then(
      result => console.log('Has permission?',result.hasPermission),
      err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.BLUETOOTH)
    );
    
    this.androidPermissions.requestPermissions(
      [
        this.androidPermissions.PERMISSION.BLUETOOTH, 
        this.androidPermissions.PERMISSION.BLUETOOTH_ADMIN, 
        this.androidPermissions.PERMISSION.BLUETOOTH_SCAN,
        this.androidPermissions.PERMISSION.BLUETOOTH_CONNECT,
        this.androidPermissions.PERMISSION.SEND_SMS
      ]
    ).then(() => {
      this.ble.scan([], 5).subscribe(
        device => this.onDeviceDiscovered(device),
        error => this.scanError(error)
      );
      setTimeout(this.setStatus.bind(this), 5000, "Scan complete");
    });
  }

  onDeviceDiscovered(device: any) {
    console.log("Discovered " + JSON.stringify(device, null, 2));
    this.devices.push(device);
  }

  // If location permission is denied, you'll end up here
  async scanError(error: any) {
    this.setStatus("Error " + error);
    let toast = await this.toastCtrl.create({
      message: "Error scanning for Bluetooth low energy devices",
      position: "middle",
      duration: 5000
    });
    toast.present();
  }

  setStatus(message: string) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  BleConnect(device: any) {
    const observer = {
      next: (x: any) => this.onConnected(x),
      error: (err: any) => this.onDeviceDisconnected(err),
      complete: () => console.log('Observer got a complete notification'),
    };
    this.ble.autoConnect(device.id, this.onConnected.bind(this), this.onDeviceDisconnected.bind(this));
  }

  BleDisconnect() {
    this.ble.disconnect(this.peripheral.id).then(
      () => console.log('Disconnected ' + JSON.stringify(this.peripheral)),
      () => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))
    );
  }


  onConnected(peripheral: any) {
    console.log(peripheral)
    Preferences.set({
      key: 'deviceId',
      value: peripheral.id
    });
    this.setStatus('Connected!');
    this.peripheral = peripheral;
  }

  async onDeviceDisconnected(peripheral: any) {
    const toast = await this.toastCtrl.create({
      message: 'The peripheral unexpectedly disconnected',
      duration: 3000,
      position: 'middle'
    });
    toast.present();
  }

  // Disconnect peripheral when leaving the page
  ionViewWillLeave() {
  console.log('ionViewWillLeave disconnecting Bluetooth');
    this.BleDisconnect();
  }
}
